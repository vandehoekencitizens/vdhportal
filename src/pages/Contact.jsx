import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Textarea } from '@/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create mailto link
    const mailtoLink = `mailto:elliotscottchan@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    
    window.location.href = mailtoLink;
    setSubmitted(true);
    
    // Reset form
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center text-slate-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#e8c547] rounded-2xl flex items-center justify-center">
              <Mail className="w-7 h-7 text-[#1e3a5f]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Contact Administration</h1>
              <p className="text-slate-300">Get in touch with government support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-[#1e3a5f]" />
                  Send a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                    <p className="text-slate-600">Your email client should open shortly.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Your Name
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Your Email
                      </label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Subject
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What is this regarding?"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Message
                      </label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Describe your inquiry or concern..."
                        className="min-h-32"
                      />
                    </div>

                    <Button 
                      type="submit"
                      className="w-full h-12 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-lg font-semibold"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-0 shadow-xl text-white">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-[#c9a227] rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-[#1e3a5f]" />
                </div>
                <h3 className="font-bold text-lg mb-2">Direct Email</h3>
                <p className="text-slate-300 text-sm mb-4">
                  You can also email us directly at:
                </p>
                <a 
                  href="mailto:elliotscottchan@gmail.com"
                  className="text-[#c9a227] hover:text-[#e8c547] transition-colors break-all"
                >
                  elliotscottchan@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-3">Response Time</h3>
                <p className="text-slate-600 text-sm">
                  We typically respond to inquiries within 24-48 hours during business days.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border border-amber-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-amber-900 mb-3">Office Hours</h3>
                <p className="text-amber-800 text-sm">
                  Monday - Friday<br />
                  9:00 AM - 5:00 PM<br />
                  Vandehoeken Standard Time
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
