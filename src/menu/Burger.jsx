import { useState } from "react";
import MenuBar from "./MenuBar";

const Burger = (props) => {
  const [open, setOpen] = useState(false);
  const base = "h-1 rounded-lg origin-left transition-all";
  // transition: all 0.3s linear;
  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className={
          "lg:hidden flex justify-around flex-nowrap flex-col w-10 h-10 p-2 rounded-md fixed top-2 right-3 z-20 cursor-pointer " +
          (open ? "" : "bg-white/85 shadow-sm")
        }
        onClick={() => setOpen(!open)}
      >
        <div
          className={
            open ? "bg-white rotate-45 " + base : "rotate-0 bg-black " + base
          }
        />
        <div
          className={
            open
              ? "bg-white translate-x-full opacity-0 " + base
              : " translate-x-0 opacity-100 bg-black " + base
          }
        />
        <div
          className={
            open ? "bg-white -rotate-45 " + base : " rotate-0 bg-black " + base
          }
        />
      </button>
      <MenuBar
        prefix={props.prefix}
        items={props.items}
        color={props.color}
        textColor={props.textColor}
        open={open}
      />
    </>
  );
};

export default Burger;
