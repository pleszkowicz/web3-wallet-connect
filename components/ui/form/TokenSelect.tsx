import { FormError } from '@/components/ui/form/FormError';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Token, TokenMapKey } from '@/const/tokens';
import { cn } from '@/lib/cn';
import { useFormikContext } from 'formik';
import Image from 'next/image';

type CryptoSelectProps = {
  className?: string;
  label?: string;
  name: string;
  onChange: (value: TokenMapKey) => void;
  tokens: Token[];
};

export const TokenSelect = ({ label, name, onChange, tokens, className }: CryptoSelectProps) => {
  const { setFieldValue, values } = useFormikContext<Record<string, string>>();
  const selectedValue = values[name] as TokenMapKey;

  return (
    <>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Select
        value={selectedValue}
        onValueChange={(value) => {
          setFieldValue(name, value);
          onChange(value as TokenMapKey);
        }}
      >
        <SelectTrigger
          id={name}
          className={cn(
            className,
            'rounded-full p-5 pl-3 pr-4 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:ring-0 overflow-hidden'
          )}
        >
          <SelectValue placeholder="Select token" />
        </SelectTrigger>

        <SelectContent>
          {tokens.map((token) => {
            return (
              <SelectItem key={token.symbol} value={token.symbol} className="flex flex-row">
                <span className="contents">
                  <Image
                    className="mr-2 inline-block shrink-0"
                    src={token.logo}
                    width={20}
                    height={20}
                    alt={token.label}
                  />
                  {token.label} ({token.symbol.toUpperCase()}){' '}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <FormError name={name} />
    </>
  );
};
