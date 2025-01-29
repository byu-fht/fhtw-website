export function ClearBox(props) {
  return (
    <div className="bg-white">
      <div className="text-default text-xl flex justify-center px-5 py-5 lg:px-[75px] md:ml-auto md:mr-auto py-3 max-w-5xl">
        {props.children}
      </div>
    </div>
  );
}

export function RedBanner(props) {
  return (
    <div className="bg-red-800">
      <div className="text-white text-xl flex justify-center px-5 py-5 lg:px-[75px] md:ml-auto md:mr-auto py-3 max-w-5xl">
        {props.children}
      </div>
    </div>
  );
}

export function GrayBox(props) {
  return (
    <Box color="bg-neutral-700" textColor="text-white">
      {props.children}
    </Box>
  );
}

export function LightGrayBox(props) {
  return (
    <Box color="bg-blue-100" textColor="text-default">
      {props.children}
    </Box>
  );
}

export function BlueBox(props) {
  return (
    <Box color="bg-byu" textColor="text-white">
      {props.children}
    </Box>
  );
}

function Box(props) {
  return (
    <div className={props.color}>
      <div
        className={
          props.textColor +
          " text-xl  px-5 pt-1 pb-[3rem] lg:px-[75px] md:ml-auto md:mr-auto max-w-5xl"
        }
      >
        {props.children}
      </div>
    </div>
  );
}
