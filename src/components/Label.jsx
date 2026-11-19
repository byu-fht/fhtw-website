// Colored link buttons for archive materials, e.g. <Paper url="/conf/2014/x.pdf" />

// The leading space matters: pages write labels right after a word
// ("University<Paper …/><Presentation …/>"), and without a space the word
// and all its labels form one unbreakable run that overflows on phones.
// inline-block keeps each label whole; padding gives a ~28px tap target.
function Label({ url, color, children }) {
  return (
    <>
      {" "}
      <a
        className={`inline-block no-underline rounded-lg ${color} text-white hover:text-white text-xs md:text-sm ml-1 my-0.5 px-2.5 py-1.5 md:py-1 leading-4 md:leading-5`}
        href={url}
      >
        {children}
      </a>
    </>
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
  <Label url={url} color="bg-sky-700">
    Abstract
  </Label>
);

export const Video = ({ url }) => (
  <Label url={url} color="bg-yellow-700">
    Video
  </Label>
);

export const Audio = ({ url }) => (
  <Label url={url} color="bg-green-700">
    Audio
  </Label>
);

export const Poster = ({ url }) => (
  <Label url={url} color="bg-orange-700">
    Poster
  </Label>
);

export const Bio = ({ url }) => (
  <Label url={url} color="bg-slate-600">
    Bio
  </Label>
);

export const Data = ({ url }) => (
  <Label url={url} color="bg-teal-700">
    Data
  </Label>
);
