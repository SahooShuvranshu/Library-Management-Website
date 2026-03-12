-- Library Management System Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  category TEXT DEFAULT 'Uncategorized',
  total_copies INTEGER DEFAULT 1 NOT NULL,
  available_copies INTEGER DEFAULT 1 NOT NULL,
  is_archived BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create borrowed_books table
CREATE TABLE IF NOT EXISTS public.borrowed_books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue'))
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowed_books ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin (Security Definer avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update all." ON public.profiles;
CREATE POLICY "Users can update own profile and admins can update all."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id OR public.is_admin() );

-- Books Policies
DROP POLICY IF EXISTS "Books are viewable by everyone." ON public.books;
CREATE POLICY "Books are viewable by everyone."
  ON public.books FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Only admins can insert books." ON public.books;
CREATE POLICY "Only admins can insert books."
  ON public.books FOR INSERT
  WITH CHECK ( public.is_admin() );

DROP POLICY IF EXISTS "Only admins can update books." ON public.books;
CREATE POLICY "Only admins can update books."
  ON public.books FOR UPDATE
  USING ( public.is_admin() );

DROP POLICY IF EXISTS "Only admins can delete books." ON public.books;
CREATE POLICY "Only admins can delete books."
  ON public.books FOR DELETE
  USING ( public.is_admin() );

-- Borrowed Books Policies
DROP POLICY IF EXISTS "Users can view their own borrowed books and admins can view all." ON public.borrowed_books;
CREATE POLICY "Users can view their own borrowed books and admins can view all."
  ON public.borrowed_books FOR SELECT
  USING ( auth.uid() = user_id OR public.is_admin() );

DROP POLICY IF EXISTS "Users can borrow books" ON public.borrowed_books;
DROP POLICY IF EXISTS "Users can borrow books and admins can issue books." ON public.borrowed_books;
CREATE POLICY "Users can borrow books and admins can issue books."
  ON public.borrowed_books FOR INSERT
  WITH CHECK ( auth.uid() = user_id OR public.is_admin() );

DROP POLICY IF EXISTS "Users can return books and admins can update." ON public.borrowed_books;
CREATE POLICY "Users can return books and admins can update."
  ON public.borrowed_books FOR UPDATE
  USING ( auth.uid() = user_id OR public.is_admin() );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user' -- Default role is user. You can manually change a user to 'admin' in the database.
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for available_copies management
CREATE OR REPLACE FUNCTION public.update_available_copies()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'borrowed' THEN
    UPDATE public.books SET available_copies = available_copies - 1 WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'borrowed' AND NEW.status = 'returned' THEN
    UPDATE public.books SET available_copies = available_copies + 1 WHERE id = NEW.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_book_borrowed ON public.borrowed_books;
CREATE TRIGGER on_book_borrowed
  AFTER INSERT OR UPDATE ON public.borrowed_books
  FOR EACH ROW EXECUTE PROCEDURE public.update_available_copies();

-- Insert some dummy books for testing
INSERT INTO public.books (title, author, description, cover_url, category, total_copies, available_copies)
VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', 'https://picsum.photos/seed/gatsby/400/600', 'Fiction', 5, 5),
('1984', 'George Orwell', 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.', 'https://picsum.photos/seed/1984/400/600', 'Science Fiction', 3, 3),
('To Kill a Mockingbird', 'Harper Lee', 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.', 'https://picsum.photos/seed/mockingbird/400/600', 'Classic', 4, 4),
('Pride and Prejudice', 'Jane Austen', 'Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language.', 'https://picsum.photos/seed/pride/400/600', 'Romance', 2, 2)
ON CONFLICT DO NOTHING;
