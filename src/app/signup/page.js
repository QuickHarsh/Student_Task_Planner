'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
        },
      },
    });
    console.log('Supabase signUp response:', { data, error });
    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
      setSession(data.session);
      // Upsert user profile in the users table
      const success = await useAuthStore.getState().upsertUserProfile(data.user.id, form.name);
      if (!success) {
        setError('Failed to save user profile.');
        return; // Stop further execution if upsert fails
      }
      setSubmitted(true);
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2">
      <div className="bg-white p-4 sm:p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">Sign Up</h1>
        {submitted ? (
          <div className="text-green-600 text-center">Signup successful! Please check your email to confirm your account.</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="border rounded px-3 py-2" />
            <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" className="border rounded px-3 py-2" />
            <input name="password" value={form.password} onChange={handleChange} required type="password" placeholder="Password" className="border rounded px-3 py-2" />
            {error && <div className="text-red-600 text-center">{error}</div>}
            <button type="submit" className="bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700">Sign Up</button>
          </form>
        )}
      </div>
    </div>
  );
}
