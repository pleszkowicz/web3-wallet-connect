import { Field } from 'formik';
import { InputHTMLAttributes } from 'react';
import { Input } from '../ui/input';

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  name: string;
};

export const FormInput = ({ className, ...props }: FormInputProps) => {
  return (
    <Field
      as={Input}
      className={`flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-indigo-900/40 border-indigo-700 text-white placeholder:text-indigo-300 h-14 pr-12 ${className}`}
      {...props}
    />
  );
};
