-- Add INSERT policy for user_roles to allow pharmacy registration
CREATE POLICY "Users can insert pharmacy role for themselves" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('pharmacy', 'customer')
);