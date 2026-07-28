
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role-check function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Profiles RLS
CREATE POLICY "Profiles viewable by self or admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- user_roles RLS
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + grant admin to seed email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles(id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  IF lower(NEW.email) = 'gedelavedhiboyz@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- DONATIONS
CREATE TYPE public.donation_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.payment_method AS ENUM ('PhonePe','Google Pay','Cash','Bank Transfer','UPI','Other');

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method payment_method NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  transaction_id TEXT,
  message TEXT,
  status donation_status NOT NULL DEFAULT 'pending',
  event_tag TEXT NOT NULL DEFAULT 'vinayaka_chavithi_2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER donations_touch BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Approved donations are public" ON public.donations FOR SELECT
  USING (status = 'approved');
CREATE POLICY "Admins see all donations" ON public.donations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone can submit a donation" ON public.donations FOR INSERT
  WITH CHECK (status = 'pending');
CREATE POLICY "Admins update donations" ON public.donations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete donations" ON public.donations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- EXPENSES
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  category TEXT,
  description TEXT,
  spent_on DATE NOT NULL DEFAULT CURRENT_DATE,
  event_tag TEXT NOT NULL DEFAULT 'vinayaka_chavithi_2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER expenses_touch BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE POLICY "Expenses public read" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Admins manage expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements public read" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- EVENT SECTIONS (dynamic homepage cards)
CREATE TABLE public.event_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  category TEXT NOT NULL DEFAULT 'event',
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Event sections public read" ON public.event_sections FOR SELECT USING (true);
CREATE POLICY "Admins manage event sections" ON public.event_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- SLIDER
CREATE TABLE public.slider_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.slider_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slider public read" ON public.slider_images FOR SELECT USING (true);
CREATE POLICY "Admins manage slider" ON public.slider_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- GALLERY
CREATE TABLE public.gallery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery cats public read" ON public.gallery_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery cats" ON public.gallery_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery images public read" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins manage gallery images" ON public.gallery_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Seed default gallery categories
INSERT INTO public.gallery_categories(name, slug, sort_order) VALUES
  ('Sankranthi 2025','sankranthi-2025',1),
  ('Vinayaka Chavithi 2024','vinayaka-chavithi-2024',2),
  ('Vinayaka Chavithi 2026','vinayaka-chavithi-2026',3),
  ('Birthdays','birthdays',4),
  ('Other Events','other-events',5);

-- Default announcement
INSERT INTO public.announcements(text, sort_order) VALUES
  ('🙏 Welcome to Gedela Vedhi Boyzz — Vinayaka Chavithi 2026 donations are now open! 🌸', 1);

-- Storage buckets (public-read)
INSERT INTO storage.buckets(id, name, public) VALUES
  ('slider','slider',true),
  ('gallery','gallery',true),
  ('events','events',true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin write
CREATE POLICY "Public read slider" ON storage.objects FOR SELECT USING (bucket_id = 'slider');
CREATE POLICY "Admins write slider" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='slider' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update slider" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='slider' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete slider" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='slider' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Admins write gallery" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='gallery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update gallery" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='gallery' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete gallery" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='gallery' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read events" ON storage.objects FOR SELECT USING (bucket_id = 'events');
CREATE POLICY "Admins write events" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id='events' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update events" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id='events' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete events" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id='events' AND public.has_role(auth.uid(),'admin'));
