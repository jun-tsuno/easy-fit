import { LuDumbbell, LuHistory, LuHouse } from "react-icons/lu";
import { NavLink } from "react-router";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { to: "/", label: "ホーム", icon: LuHouse, end: true },
  { to: "/history", label: "履歴", icon: LuHistory, end: false },
  { to: "/exercises", label: "種目", icon: LuDumbbell, end: false },
] as const;

function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="グローバルメニュー">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? `${styles.item} ${styles.itemActive}` : styles.item
          }
        >
          <Icon className={styles.icon} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export { BottomNav };
