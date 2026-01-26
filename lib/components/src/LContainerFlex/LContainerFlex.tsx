import React from "react";

interface LContainerFlexProps {
  children?: React.ReactNode;
  gap?: number;
}

const LContainerFlex: React.FC<LContainerFlexProps> = ({ children, gap = 0 }) => {
  return (
    <div style={{ display: "flex", gap }}>
      {children}
    </div>
  );
};

export default LContainerFlex;
