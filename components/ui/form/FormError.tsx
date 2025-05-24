import { cn } from '@/lib/cn';
import { ErrorMessage, ErrorMessageProps } from 'formik';

export const FormError = ({ className, ...props }: ErrorMessageProps) => {
  return <ErrorMessage {...props} component="div" className={cn('text-yellow-300 text-sm', className)} />;
};
