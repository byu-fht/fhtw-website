// Colored link buttons for archive materials, e.g. <Paper url="/conf/2014/x.pdf" />

function Label({ url, color, children }) {
  return (
    <a
      className={`no-underline rounded-lg ${color} text-white hover:text-white w-auto text-xs md:text-sm ml-2 px-2 py-1`}
      href={url}
    >
      {children}
    </a>
  );
}

export const Presentation = ({ url }) => (
  <Label url={url} color="bg-byu">
    Presentation
  </Label>
);

export const Paper = ({ url }) => (
  <Label url={url} color="bg-red">
    Paper
  </Label>
);

export const Report = ({ url }) => (
  <Label url={url} color="bg-purple-700">
    Report
  </Label>
);

export const Abstract = ({ url }) => (
  <Label url={url} color="bg-sky-600">
    Abstract
  </Label>
);

export const Video = ({ url }) => (
  <Label url={url} color="bg-yellow-600">
    Video
  </Label>
);

export const Audio = ({ url }) => (
  <Label url={url} color="bg-green-600">
    Audio
  </Label>
);

export const Poster = ({ url }) => (
  <Label url={url} color="bg-orange-400">
    Poster
  </Label>
);

export const Bio = ({ url }) => (
  <Label url={url} color="bg-slate-500">
    Bio
  </Label>
);

export const Data = ({ url }) => (
  <Label url={url} color="bg-teal-700">
    Data
  </Label>
);
