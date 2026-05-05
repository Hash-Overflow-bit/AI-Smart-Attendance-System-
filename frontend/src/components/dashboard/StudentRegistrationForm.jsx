import React, { useState, useEffect } from 'react';
import { UserCheck, AlertCircle, User, Mail, Hash, BookOpen, Building2 } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function StudentRegistrationForm({ onSubmit, courses = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    courseId: '',
    department: 'Computer Science'
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format (user@domain.com)';
    }

    if (!formData.rollNo.trim()) {
      newErrors.rollNo = 'Roll Number is required';
    } else if (!/^[a-zA-Z0-9-]+$/.test(formData.rollNo)) {
      newErrors.rollNo = 'Format must be alphanumeric (e.g. CS-101)';
    }

    if (!formData.courseId) newErrors.courseId = 'Please assign a course';
    
    // Check if Roll Number already exists in local registry
    const existing = JSON.parse(localStorage.getItem('smart_attendance_enrolled_students') || '[]');
    if (existing.some(s => s.rollNo.toLowerCase() === formData.rollNo.toLowerCase())) {
      newErrors.rollNo = 'Duplicate Entry: Roll Number already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // System auto-generates Student ID (STU-XXXX) derived from Roll Number
      const studentData = {
        ...formData,
        studentId: `STU-${formData.rollNo.toUpperCase()}`,
        status: 'Pending', // Lifecycle Status: Initial state
        id: Math.random().toString(36).substr(2, 9)
      };
      onSubmit(studentData);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4 text-left">
      <div className="text-center mb-6">
        <Button type="submit" variant="primary" icon={UserCheck} className="w-full h-11 text-base">
          Proceed to Face Capture
        </Button>
      </div>
    </form>
  );
}
