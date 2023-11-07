export function Presentation(props) {
  return (
    <a
      className="no-underline rounded-lg bg-byu text-white hover:text-white w-auto text-xs md:text-sm ml-2 px-2 py-1"
      href={props.url}
    >
      Presentation
    </a>
  );
}

export function Paper(props) {
  return (
    <a
      className="no-underline rounded-lg bg-red text-white hover:text-white w-auto text-xs md:text-sm ml-2 px-2 py-1"
      href={props.url}
    >
      Paper
    </a>
  );
}

export function Abstract(props) {
  return (
    <a
      className="no-underline rounded-lg bg-sky-600 text-white hover:text-white w-auto text-xs md:text-sm ml-2 px-2 py-1"
      href={props.url}
    >
      Abstract
    </a>
  );
}

export function Video(props) {
  return (
    <a
      className="no-underline rounded-lg bg-yellow-600 text-white hover:text-white w-auto text-xs md:text-sm ml-2 px-2 py-1"
      href={props.url}
    >
      Video
    </a>
  );
}

export function Audio(props) {
  return (
    <a
      className="no-underline rounded-lg bg-green-600 text-white hover:text-white w-auto text-xs md:text-sm ml-2 px-2 py-1"
      href={props.url}
    >
      Audio
    </a>
  );
}

export function Poster(props) {
  return (
    <a
      className="no-underline rounded-lg bg-orange-400 text-white hover:text-white w-auto text-xs md:text-sm ml-2 px-2 py-1"
      href={props.url}
    >
      Poster
    </a>
  );
}
