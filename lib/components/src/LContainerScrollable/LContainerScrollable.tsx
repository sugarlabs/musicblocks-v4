import React from "react";

interface LContainerScrollableProps {
  children?: React.ReactNode;
  height?: string | number;
}

const LContainerScrollable: React.FC<LContainerScrollableProps> = ({
  children,
  height = "100%",
}) => {
  return (
    <div style={{ overflowY: "auto", height }}>
      {children}
    </div>
  );
};

export default LContainerScrollable;
