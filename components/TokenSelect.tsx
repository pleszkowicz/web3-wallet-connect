import { Token, TokenMapKey } from '@/const/tokens';
import { ErrorMessage, useFormikContext } from 'formik';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type CryptoSelectProps = {
  label: string;
  name: string;
  onChange: (value: TokenMapKey) => void;
  tokens: Token[];
};

export const TokenSelect = ({ label, name, onChange, tokens }: CryptoSelectProps) => {
  const { setFieldValue, values } = useFormikContext<Record<string, string>>();
  const selectedValue = values[name] as TokenMapKey;

  return (
    <>
      <Label htmlFor={name}>{label}</Label>
      <Select
        value={selectedValue}
        onValueChange={(value) => {
          setFieldValue(name, value);
          onChange(value as TokenMapKey);
        }}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder="Select token" />
        </SelectTrigger>

        <SelectContent>
          {tokens.map((token) => {
            return (
              <SelectItem key={token.symbol} value={token.symbol}>
                {token.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <ErrorMessage name={name} component="div" className="text-red-500" />
    </>
  );
};
