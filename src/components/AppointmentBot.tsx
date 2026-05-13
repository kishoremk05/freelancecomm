import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, MessageCircle, X, Send, Loader2, Calendar as CalendarIcon, Clock, ChevronLeft } from "lucide-react";
import { easePremium } from "@/lib/motion";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Time slots available for booking
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

// Helper function to format time for display
const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
};

const AppointmentBot = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"intro" | "date" | "time" | "details" | "done" | "error">("intro");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [meetLink, setMeetLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reset = () => {
    setStep("intro");
    setSelectedDate(undefined);
    setSelectedTime("");
    setName("");
    setEmail("");
    setMeetLink(null);
    setErrorMessage(null);
    setLoading(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !name || !email) return;
    
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Combine date and time into ISO datetime
      const [hours, minutes] = selectedTime.split(':');
      const meetingDateTime = new Date(selectedDate);
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const meetingTime = meetingDateTime.toISOString();
      
      // Call backend API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          meetingTime,
          duration: 30,
          message: `Meeting scheduled via FreelanceComm website for ${format(selectedDate, 'PPP')} at ${formatTimeForDisplay(selectedTime)}`
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMeetLink(data.data.meetLink);
        setStep("done");
      } else {
        setErrorMessage(data.message || 'Failed to create meeting');
        setStep("error");
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrorMessage('Failed to connect to booking service. Please try again.');
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label="Book an appointment"
        data-cursor-hover
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.6, ease: easePremium }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-dark shadow-[0_18px_40px_-12px_hsl(var(--gold)/0.6)] sm:bottom-7 sm:right-7 sm:h-16 sm:w-16"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--gold-light)) 0%, hsl(var(--gold)) 55%, hsl(var(--gold-deep)) 100%)",
          borderLeft: "2px solid hsl(var(--gold-deep))",
          borderBottom: "2px solid hsl(var(--gold-deep))",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3, ease: easePremium }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="cal"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3, ease: easePremium }}
            >
              <CalendarCheck className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.45, ease: easePremium }}
            className="fixed bottom-24 right-5 z-[60] flex w-[calc(100vw-2.5rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl bg-cream shadow-[0_30px_80px_-20px_hsl(var(--dark)/0.35)] sm:bottom-28 sm:right-7"
            style={{
              borderLeft: "2px solid hsl(var(--gold))",
              borderBottom: "2px solid hsl(var(--gold))",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-dark px-5 py-4 text-cream">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-dark">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="font-display-bold text-sm">Book an Appointment</div>
                <div className="font-mono-tag text-[10px] text-cream/60">
                  Replies in &lt; 24h
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[60vh] overflow-y-auto bg-cream px-5 py-5">
              <AnimatePresence mode="wait">
                {step === "intro" && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: easePremium }}
                  >
                    <p className="font-body text-sm text-dark/85">
                      Hi 👋 Want to chat about your project? Pick a date and time that works for you.
                    </p>
                    <button
                      data-cursor-hover
                      onClick={() => setStep("date")}
                      className="btn-premium mt-5 !w-full !py-2.5 !text-sm"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      Choose date & time →
                    </button>
                  </motion.div>
                )}

                {step === "date" && (
                  <motion.div
                    key="date"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: easePremium }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono-tag text-[10px] text-dark/60">
                        // Select a date
                      </p>
                      <button
                        onClick={() => setStep("intro")}
                        className="text-dark/40 hover:text-dark transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const maxDate = new Date();
                          maxDate.setDate(maxDate.getDate() + 30);
                          return date < today || date > maxDate;
                        }}
                        className="rounded-md border-0"
                        classNames={{
                          months: "space-y-4",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-display-bold text-dark",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-dark",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-dark/60 rounded-md w-9 font-mono-tag text-[10px]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gold/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-body text-sm hover:bg-gold/20 hover:text-dark rounded-md transition-colors",
                          day_selected: "bg-gold text-dark hover:bg-gold hover:text-dark focus:bg-gold focus:text-dark font-display-bold",
                          day_today: "bg-dark/5 text-dark font-display-bold",
                          day_outside: "text-dark/30 opacity-50",
                          day_disabled: "text-dark/20 opacity-30",
                          day_hidden: "invisible",
                        }}
                      />
                    </div>

                    {selectedDate && (
                      <div className="rounded-md bg-gold/15 px-3 py-2 text-center font-body text-sm text-gold-deep">
                        📅 {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </div>
                    )}

                    <button
                      data-cursor-hover
                      onClick={() => setStep("time")}
                      disabled={!selectedDate}
                      className="btn-premium !w-full !py-2.5 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to time →
                    </button>
                  </motion.div>
                )}

                {step === "time" && (
                  <motion.div
                    key="time"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: easePremium }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono-tag text-[10px] text-dark/60">
                        // Select a time
                      </p>
                      <button
                        onClick={() => setStep("date")}
                        className="text-dark/40 hover:text-dark transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>

                    {selectedDate && (
                      <div className="rounded-md bg-gold/15 px-3 py-2 text-center font-body text-xs text-gold-deep">
                        📅 {format(selectedDate, 'EEE, MMM d')}
                      </div>
                    )}

                    <div className="max-h-[240px] overflow-y-auto pr-2 space-y-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          data-cursor-hover
                          onClick={() => setSelectedTime(time)}
                          className={`w-full flex items-center justify-between border px-4 py-2.5 text-left font-body text-sm transition-all ${
                            selectedTime === time
                              ? 'border-gold bg-gold/20 text-dark font-display-bold'
                              : 'border-dark/15 bg-cream text-dark hover:border-gold hover:bg-gold/10'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTimeForDisplay(time)}
                          </span>
                          <span className="font-mono-tag text-[10px] text-gold">
                            30m
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      data-cursor-hover
                      onClick={() => setStep("details")}
                      disabled={!selectedTime}
                      className="btn-premium !w-full !py-2.5 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to details →
                    </button>
                  </motion.div>
                )}

                {step === "details" && (
                  <motion.form
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: easePremium }}
                    onSubmit={handleBooking}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-mono-tag text-[10px] text-dark/60">
                        // Your details
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep("time")}
                        className="text-dark/40 hover:text-dark transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="rounded-md bg-gold/15 px-3 py-2 font-mono-tag text-[10px] text-gold-deep">
                      📅 {selectedDate && format(selectedDate, 'EEE, MMM d')} · {selectedTime && formatTimeForDisplay(selectedTime)} · 30m
                    </div>
                    <input
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="w-full border border-dark/15 bg-cream px-3 py-2.5 font-body text-sm text-dark outline-none focus:border-gold disabled:opacity-50"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full border border-dark/15 bg-cream px-3 py-2.5 font-body text-sm text-dark outline-none focus:border-gold disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      data-cursor-hover
                      disabled={loading}
                      className="btn-premium !w-full !py-2.5 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating meeting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Confirm booking
                        </>
                      )}
                    </button>
                  </motion.form>
                )}

                {step === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: easePremium }}
                    className="text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold text-dark">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 font-display-bold text-lg text-dark">
                      You're booked!
                    </h4>
                    <p className="mt-2 font-body text-sm text-dark/70">
                      We've sent a Google Calendar invite to{" "}
                      <span className="text-gold-deep">{email}</span> and{" "}
                      <span className="text-gold-deep">freelancecomm9@gmail.com</span> for{" "}
                      <span className="text-gold-deep">{selectedDate && format(selectedDate, 'PPP')} at {selectedTime && formatTimeForDisplay(selectedTime)}</span>.
                    </p>
                    {meetLink && (
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-hover
                        className="mt-4 inline-block rounded-lg bg-gold px-4 py-2 font-body text-sm text-dark transition-all hover:bg-gold-deep"
                      >
                        🎥 Join Google Meet
                      </a>
                    )}
                    <button
                      data-cursor-hover
                      onClick={reset}
                      className="mt-5 block w-full font-mono-tag text-[10px] text-dark/60 underline-offset-4 hover:text-dark hover:underline"
                    >
                      Book another
                    </button>
                  </motion.div>
                )}

                {step === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: easePremium }}
                    className="text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-600">
                      <X className="h-5 w-5" />
                    </div>
                    <h4 className="mt-4 font-display-bold text-lg text-dark">
                      Booking Failed
                    </h4>
                    <p className="mt-2 font-body text-sm text-dark/70">
                      {errorMessage || 'Something went wrong. Please try again.'}
                    </p>
                    <button
                      data-cursor-hover
                      onClick={() => setStep("details")}
                      className="btn-premium mt-5 !w-full !py-2.5 !text-sm"
                    >
                      Try Again
                    </button>
                    <button
                      data-cursor-hover
                      onClick={reset}
                      className="mt-3 block w-full font-mono-tag text-[10px] text-dark/60 underline-offset-4 hover:text-dark hover:underline"
                    >
                      Start over
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppointmentBot;
