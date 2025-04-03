import { PropsWithChildren } from "react";

export const Loader = ({ children }: PropsWithChildren) => {
  return <p className="text-muted-foreground">{children}</p>;
};
