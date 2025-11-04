import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const prisma = new PrismaClient();

// ==================== PAYMENT PROCESSING ====================

// Create payment intent (Razorpay)
router.post('/create-intent', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { bookingId, amount, currency = 'INR' } = req.body;

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, customerId: req.user.id },
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Booking cannot be paid for' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: req.user.id,
        amount: parseFloat(amount),
        method: 'CARD', // Default method
        status: 'PENDING',
        gatewayResponse: JSON.stringify({
          amount,
          currency,
          bookingId,
          customerId: req.user.id
        })
      }
    });

    // For Razorpay, you would typically:
    // 1. Create order on Razorpay
    // 2. Return order details to frontend
    // 3. Frontend opens Razorpay checkout

    // Mock Razorpay order creation (replace with actual Razorpay API call)
    const razorpayOrder = {
      id: `order_${Date.now()}`,
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${payment.id}`,
      notes: {
        bookingId,
        customerId: req.user.id
      }
    };

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        razorpayOrder,
        key: process.env.RAZORPAY_KEY_ID // Frontend needs this
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create payment intent' });
  }
});

// Verify payment (Razorpay)
router.post('/verify', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify payment belongs to user
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId: req.user.id },
      include: { booking: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Verify Razorpay signature (replace with actual verification)
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(paymentId + '|' + razorpayPaymentId)
    //   .digest('hex');

    // if (razorpaySignature !== expectedSignature) {
    //   return res.status(400).json({ success: false, message: 'Invalid signature' });
    // }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        gatewayId: razorpayPaymentId,
        gatewayResponse: JSON.stringify({
          razorpayPaymentId,
          razorpaySignature,
          verified: true
        })
      }
    });

    // Update booking status
    if (payment.booking) {
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'CONFIRMED' }
      });

      // Create booking event
      await prisma.bookingEvent.create({
        data: {
          bookingId: payment.booking.id,
          type: 'PAYMENT_COMPLETED',
          data: JSON.stringify({
            paymentId,
            razorpayPaymentId,
            amount: payment.amount
          })
        }
      });
    }

    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

// Create Stripe payment intent
router.post('/stripe/create-intent', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { bookingId, amount, currency = 'usd' } = req.body;

    // Verify booking belongs to user
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, customerId: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Booking cannot be paid for' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: req.user.id,
        amount: parseFloat(amount),
        method: 'CARD',
        status: 'PENDING',
        gatewayResponse: JSON.stringify({
          amount,
          currency,
          bookingId,
          customerId: req.user.id
        })
      }
    });

    // For Stripe, you would typically:
    // 1. Create PaymentIntent on Stripe
    // 2. Return client secret to frontend
    // 3. Frontend confirms payment with Stripe

    // Mock Stripe PaymentIntent creation
    const stripePaymentIntent = {
      id: `pi_${Date.now()}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      status: 'requires_payment_method'
    };

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        stripePaymentIntent,
        key: process.env.STRIPE_PUBLISHABLE_KEY
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create Stripe payment intent' });
  }
});

// Confirm Stripe payment
router.post('/stripe/confirm', requireAuth, requireRole(['CUSTOMER']), async (req, res) => {
  try {
    const { paymentId, stripePaymentIntentId } = req.body;

    // Verify payment belongs to user
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId: req.user.id },
      include: { booking: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        gatewayId: stripePaymentIntentId,
        gatewayResponse: JSON.stringify({
          stripePaymentIntentId,
          confirmed: true
        })
      }
    });

    // Update booking status to AWAITING_MANAGER for manager to assign vendor
    if (payment.booking) {
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: { status: 'AWAITING_MANAGER' }
      });

      // Create booking event
      await prisma.bookingEvent.create({
        data: {
          bookingId: payment.booking.id,
          type: 'PAYMENT_COMPLETED',
          data: JSON.stringify({
            paymentId,
            stripePaymentIntentId,
            amount: payment.amount
          })
        }
      });
    }

    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to confirm payment' });
  }
});

// ==================== PAYMENT WEBHOOKS ====================

// Razorpay webhook
router.post('/webhook/razorpay', async (req, res) => {
  try {
    const { event, payload } = req.body;

    // Verify webhook signature (replace with actual verification)
    // const signature = req.headers['x-razorpay-signature'];
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    //   .update(JSON.stringify(req.body))
    //   .digest('hex');

    // if (signature !== expectedSignature) {
    //   return res.status(400).json({ error: 'Invalid signature' });
    // }

    switch (event) {
      case 'payment.captured':
        await handleRazorpayPaymentSuccess(payload);
        break;
      case 'payment.failed':
        await handleRazorpayPaymentFailure(payload);
        break;
      case 'refund.processed':
        await handleRazorpayRefundProcessed(payload);
        break;
      default:
        console.log(`Unhandled Razorpay event: ${event}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook
router.post('/webhook/stripe', async (req, res) => {
  try {
    const { type, data } = req.body;

    // Verify webhook signature (replace with actual verification)
    // const signature = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(
    //   req.body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    switch (type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSuccess(data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailure(data.object);
        break;
      case 'charge.refunded':
        await handleStripeRefundProcessed(data.object);
        break;
      default:
        console.log(`Unhandled Stripe event: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ==================== WEBHOOK HANDLERS ====================

async function handleRazorpayPaymentSuccess(payload: any) {
  try {
    const { id: razorpayPaymentId, order_id, amount } = payload.payment.entity;

    // Find payment by order_id or create new one
    let payment = await prisma.payment.findFirst({
      where: { gatewayId: razorpayPaymentId }
    });

    if (!payment) {
      // Create new payment record if not found
      payment = await prisma.payment.create({
        data: {
          bookingId: order_id, // Assuming order_id maps to bookingId
          userId: 'unknown', // You'll need to get this from the order
          amount: amount / 100, // Convert from paise
          method: 'CARD',
          status: 'COMPLETED',
          gatewayId: razorpayPaymentId,
          gatewayResponse: JSON.stringify(payload)
        }
      });
    } else {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          gatewayResponse: JSON.stringify(payload)
        }
      });
    }

    // Update booking status to AWAITING_MANAGER for manager to assign vendor
    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'AWAITING_MANAGER' }
      });

      // Create booking event
      await prisma.bookingEvent.create({
        data: {
          bookingId: payment.bookingId,
          type: 'PAYMENT_COMPLETED',
          data: JSON.stringify({
            paymentId: payment.id,
            razorpayPaymentId,
            amount: payment.amount
          })
        }
      });
    }

    console.log(`Razorpay payment ${razorpayPaymentId} processed successfully`);
  } catch (error) {
    console.error('Error handling Razorpay payment success:', error);
  }
}

async function handleRazorpayPaymentFailure(payload: any) {
  try {
    const { id: razorpayPaymentId } = payload.payment.entity;

    // Update payment status
    await prisma.payment.updateMany({
      where: { gatewayId: razorpayPaymentId },
      data: {
        status: 'FAILED',
        gatewayResponse: JSON.stringify(payload)
      }
    });

    console.log(`Razorpay payment ${razorpayPaymentId} failed`);
  } catch (error) {
    console.error('Error handling Razorpay payment failure:', error);
  }
}

async function handleRazorpayRefundProcessed(payload: any) {
  try {
    const { id: razorpayRefundId, payment_id, amount } = payload.refund.entity;

    // Update payment status
    await prisma.payment.updateMany({
      where: { gatewayId: payment_id },
      data: {
        status: 'REFUNDED',
        refundAmount: amount / 100,
        refundedAt: new Date(),
        gatewayResponse: JSON.stringify(payload)
      }
    });

    console.log(`Razorpay refund ${razorpayRefundId} processed`);
  } catch (error) {
    console.error('Error handling Razorpay refund:', error);
  }
}

async function handleStripePaymentSuccess(paymentIntent: any) {
  try {
    const { id: stripePaymentIntentId, amount, currency } = paymentIntent;

    // Find payment by gateway ID
    let payment = await prisma.payment.findFirst({
      where: { gatewayId: stripePaymentIntentId }
    });

    if (!payment) {
      // Create new payment record if not found
      payment = await prisma.payment.create({
        data: {
          bookingId: 'unknown', // You'll need to get this from metadata
          userId: 'unknown', // You'll need to get this from metadata
          amount: amount / 100, // Convert from cents
          method: 'CARD',
          status: 'COMPLETED',
          gatewayId: stripePaymentIntentId,
          gatewayResponse: JSON.stringify(paymentIntent)
        }
      });
    } else {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          gatewayResponse: JSON.stringify(paymentIntent)
        }
      });
    }

    // Update booking status to AWAITING_MANAGER for manager to assign vendor
    if (payment.bookingId && payment.bookingId !== 'unknown') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'AWAITING_MANAGER' }
      });

      // Create booking event
      await prisma.bookingEvent.create({
        data: {
          bookingId: payment.bookingId,
          type: 'PAYMENT_COMPLETED',
          data: JSON.stringify({
            paymentId: payment.id,
            stripePaymentIntentId,
            amount: payment.amount
          })
        }
      });
    }

    console.log(`Stripe payment ${stripePaymentIntentId} processed successfully`);
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
  }
}

async function handleStripePaymentFailure(paymentIntent: any) {
  try {
    const { id: stripePaymentIntentId } = paymentIntent;

    // Update payment status
    await prisma.payment.updateMany({
      where: { gatewayId: stripePaymentIntentId },
      data: {
        status: 'FAILED',
        gatewayResponse: JSON.stringify(paymentIntent)
      }
    });

    console.log(`Stripe payment ${stripePaymentIntentId} failed`);
  } catch (error) {
    console.error('Error handling Stripe payment failure:', error);
  }
}

async function handleStripeRefundProcessed(charge: any) {
  try {
    const { id: stripeChargeId, amount, currency } = charge;

    // Update payment status
    await prisma.payment.updateMany({
      where: { gatewayId: stripeChargeId },
      data: {
        status: 'REFUNDED',
        refundAmount: amount / 100,
        refundedAt: new Date(),
        gatewayResponse: JSON.stringify(charge)
      }
    });

    console.log(`Stripe refund for charge ${stripeChargeId} processed`);
  } catch (error) {
    console.error('Error handling Stripe refund:', error);
  }
}

// ==================== PAYMENT METHODS ====================

// Get available payment methods
router.get('/methods', requireAuth, async (req, res) => {
  try {
    const methods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay with Visa, Mastercard, or other cards',
        icon: '💳',
        supported: ['razorpay', 'stripe']
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI apps like Google Pay, PhonePe',
        icon: '📱',
        supported: ['razorpay']
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Pay using your bank account',
        icon: '🏦',
        supported: ['razorpay']
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        description: 'Pay using Paytm, Amazon Pay, or other wallets',
        icon: '👛',
        supported: ['razorpay']
      }
    ];

    res.json({ success: true, data: methods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
  }
});

export default router;