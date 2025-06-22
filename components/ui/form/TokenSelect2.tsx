import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Token, TokenMapKey } from '@/const/tokens';
import { cn } from '@/lib/cn';
import Image from 'next/image';

type CryptoSelectProps = {
  className?: string;
  label?: string;
  name: string;
  onChange: (value: TokenMapKey) => void;
  tokens: Token[];
  value: TokenMapKey;
};

export const TokenSelect2 = ({ label, name, onChange, tokens, className, value }: CryptoSelectProps) => {
  return (
    <>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Select
        value={value}
        onValueChange={(value) => {
          onChange(value as TokenMapKey);
        }}
      >
        <SelectTrigger
          id={name}
          className={cn(
            className,
            'overflow-hidden rounded-full border-gray-600 bg-gray-700 p-5 pr-4 pl-3 text-white hover:bg-gray-600 focus:ring-0'
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
      {/* <FormError name={name} /> */}
    </>
  );
};
