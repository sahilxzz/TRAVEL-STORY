import React from "react";
import { GrMapLocation } from "react-icons/gr";
import { MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md";
import moment from "moment";

const ViewTravelStory = ({ storyInfo, onClose, onEditClick, onDeleteClick }) => {
  return (
    <div className="relative">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-end justify-between gap-2">
        <h1 className="text-xl sm:text-2xl text-slate-900 font-semibold">
          {storyInfo?.title}
        </h1>

        <div className="flex flex-wrap gap-2 bg-cyan-50/50 p-2 rounded-md">
          <button className="btn-small" onClick={onEditClick}>
            <MdUpdate className="text-lg" />
            UPDATE STORY
          </button>
          <button className="btn-small btn-delete" onClick={onDeleteClick}>
            <MdDeleteOutline className="text-lg" />
            DELETE
          </button>
          <button onClick={onClose}>
            <MdClose className="text-xl text-slate-400" />
          </button>
        </div>
      </div>

      {/* Date and Locations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-3 text-sm text-slate-600">
        <span>{storyInfo && moment(storyInfo.visitedDate).format("DD MMM YYYY")}</span>

        <div className="flex items-center gap-2 text-cyan-600 bg-cyan-100 px-3 py-1 rounded text-xs">
          <GrMapLocation className="text-base" />
          <span className="truncate max-w-[200px] sm:max-w-none">
            {storyInfo?.visitedLocation?.join(", ")}
          </span>
        </div>
      </div>

      {/* Story Image */}
      {storyInfo?.imageUrl && (
        <img
          src={storyInfo.imageUrl}
          alt="Travel"
          className="w-full h-52 sm:h-72 object-cover rounded-lg mt-4"
        />
      )}

      {/* Story Description */}
      <div className="mt-4">
        <p className="text-sm sm:text-base text-slate-900 leading-relaxed text-justify whitespace-pre-line">
          {storyInfo?.story}
        </p>
      </div>
    </div>
  );
};

export default ViewTravelStory;
