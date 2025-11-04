import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const BookingPage: React.FC = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement booking logic
    console.log('Booking submitted:', {
      vendorId,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      customerId: user?.id
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-primary hover:text-primary/80 mb-4 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-foreground">Book Appointment</h1>
            <p className="text-muted-foreground mt-2">
              Schedule your beauty service with our professional vendor
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <form onSubmit={handleBooking} className="space-y-6">
              {/* Service Selection */}
              <div>
                <label htmlFor="service" className="block text-sm font-medium mb-2">
                  Select Service
                </label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-3 border border-input rounded-md bg-background"
                  required
                >
                  <option value="">Choose a service...</option>
                  <option value="manicure">Manicure - $25</option>
                  <option value="pedicure">Pedicure - $35</option>
                  <option value="haircut">Haircut - $45</option>
                  <option value="facial">Facial - $60</option>
                  <option value="makeup">Makeup - $75</option>
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-input rounded-md bg-background"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-2">
                  Select Time
                </label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-3 border border-input rounded-md bg-background"
                  required
                >
                  <option value="">Choose a time...</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              {/* Booking Summary */}
              {selectedService && selectedDate && selectedTime && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Booking Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="capitalize">{selectedService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{selectedTime}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 transition-colors font-medium"
                disabled={!selectedService || !selectedDate || !selectedTime}
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
