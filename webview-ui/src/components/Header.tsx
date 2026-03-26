interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header = ({ onOpenSettings }: HeaderProps) => {
  return (
    <div className="header">
      <button className="settings-btn" onClick={onOpenSettings}>
        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
          <path d="M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm.5 9.5a.75.75 0 0 1-1 0V6.636l-1.96 1.132a.75.75 0 0 1-.75-1.298l2.836-1.637A.75.75 0 0 1 8.5 5.5v6.5Z"/>
        </svg>
        <span>Settings</span>
      </button>
    </div>
  );
};
