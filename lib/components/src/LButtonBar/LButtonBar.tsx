import React from "react";

interface LButtonBarProps {
  children?: React.ReactNode;
}

const LButtonBar: React.FC<LButtonBarProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default LButtonBar;
