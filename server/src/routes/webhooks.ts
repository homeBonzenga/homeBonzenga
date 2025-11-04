import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ==================== PAYMENT WEBHOOKS ====================

// Razorpay webhook
router.post('/razorpay', async (req, res) => {
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
router.post('/stripe', async (req, res) => {
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

export { router as webhookRoutes };