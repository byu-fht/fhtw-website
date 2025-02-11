import { useState } from "react";
import MenuBar from "./MenuBar";

const Burger = (props) => {
  const [open, setOpen] = useState(false);
  const base = "h-1 rounded-lg origin-left transition-all";
  // transition: all 0.3s linear;
  return (
    <>
      <div
        className="lg:hidden flex justify-around flex-nowrap flex-col w-7 h-7 fixed top-3 right-5 z-20"
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
      </div>
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
