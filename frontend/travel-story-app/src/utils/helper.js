import { assets } from "../assets/assets";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

export const getEmptyCardMessage = (filterType) => {
  switch (filterType) {
    case "search":
      return "Oops! No stories found mathcing your search.";

    case "date":
      return "No stories found matching your given date range.";

    default:
      return "`Start creating your first Travel Story! Click the 'Add' button capture your thoughts, ideas and memories. Let's get started`";
  }
};

export const getEmptyCarding= (filterType) => {
  switch (filterType) {
    case "search":
      return assets.notFound;

    case "date":
      return assets.notFoundDate

    default:
      return assets.emptygif
  }
};
