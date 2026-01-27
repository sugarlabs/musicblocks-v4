import React, { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface LContainerWithTabsProps {
  tabs: Tab[];
}

const LContainerWithTabs: React.FC<LContainerWithTabsProps> = ({ tabs }) => {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {tabs.map((tab, idx) => (
          <button key={idx} onClick={() => setActive(idx)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        {tabs[active]?.content}
      </div>
    </div>
  );
};

export default LContainerWithTabs;
