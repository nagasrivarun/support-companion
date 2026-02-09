CREATE POLICY "Staff can delete automation logs"
ON public.automation_logs
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'agent'::app_role));