import React, { useState, useEffect } from "react";
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md";
import DateSelector from "../../components/input/DateSelector";
import ImageSelector from "../../components/input/ImageSelector";
import TagInput from "../../components/input/TagInput";
import axiosInstance from "../../utils/axiosInstance";
import uploadImage from "../../utils/uploadImage";
import { toast } from "react-toastify";
import moment from "moment";

const AddEditTravelStory = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedLocation, setVisitedLocation] = useState(
    storyInfo?.visitedLocation || []
  );
  const [visitedDate, setVisitedDate] = useState(
    storyInfo?.visitedDate || null
  );

  const [error, setError] = useState("");

  // Add new travel story
  const addNewTravelStory = async () => {
    try {
      let imageUrl = "";

      // Upload Image if present
      if (storyImg) {
        const imgUploadRes = await uploadImage(storyImg);

        // Get image URL
        imageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post("/add-travel-story", {
        title,
        story,
        imageUrl: imageUrl || "",
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      });

      if (response.data && response.data.story) {
        console.log("aagya");
        toast.success("Story added successfully");
        // Refresh stories
        getAllTravelStories();
        // Close modal or form
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        // Handle unexpected error
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Update travel story
  const updateTravelStory = async () => {
    const storyId = storyInfo._id;

    try {
      let imageUrl = "";

      let postData = {
        title,
        story,
        imageUrl: storyInfo.imageUrl || "",
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      };

      if (typeof storyImg === "object") {
        // Upload new image
        const imgUploadRes = await uploadImage(storyImg);
        imageUrl = imgUploadRes.imageUrl || "";

        postData = {
          ...postData,
          imageUrl: imageUrl,
        };
      }

      const response = await axiosInstance.put(
        "/edit-story/" + storyId,
        postData
      );

      if (response.data && response.data.story) {
        console.log("aagya");
        toast.success("Story updated successfully");
        // Refresh stories
        getAllTravelStories();
        // Close modal or form
        onClose();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        console.log(error);
        // Handle unexpected error
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleAddOrUpdateClick = () => {
    console.log("Input Data:", {
      title,
      storyImg,
      story,
      visitedLocation,
      visitedDate,
    });

    if (!title) {
      setError("Please enter the title");
      return;
    }

    if (!story) {
      setError("Please enter the story");
      return;
    }

    setError("");

    if (type === "edit") {
      updateTravelStory();
    } else {
      addNewTravelStory();
    }
  };

  // delete story image and update the story
  const handleDeleteStoryImg = async () => {
    // Deleting the image
    const deleteImgRes = await axiosInstance.delete("/delete-image", {
      params: {
        imageUrl: storyInfo.imageUrl,
      },
    });

    if(deleteImgRes.data){
      const storyId = storyInfo._id;

      const postData = {
        title,
        story,
        imageUrl: storyInfo.imageUrl || "",
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      };

      // Updating story
      const response = await axiosInstance.put("edit-story/" + storyId,
        postData
      );
      setStoryImg(null);
    }
  };

  return (
  <div className="relative px-4 py-6 sm:px-6 sm:py-8 max-h-screen overflow-y-auto">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h5 className="text-xl font-medium text-slate-700">
        {type === "add" ? "Add Story" : "Update Story"}
      </h5>

      <div className="flex flex-wrap items-center gap-2 bg-cyan-50/50 p-2 rounded-lg">
        {type === "add" ? (
          <button className="btn-small" onClick={handleAddOrUpdateClick}>
            <MdAdd className="text-lg" />
            ADD STORY
          </button>
        ) : (
          <>
            <button className="btn-small" onClick={handleAddOrUpdateClick}>
              <MdUpdate className="text-lg" />
              UPDATE STORY
            </button>

            <button className="btn-small btn-delete" onClick={onClose}>
              <MdDeleteOutline className="text-lg" />
              DELETE
            </button>
          </>
        )}

        <button className="" onClick={onClose}>
          <MdClose className="text-xl text-slate-400" />
        </button>
      </div>
    </div>

    {error && (
      <p className="text-red-500 text-xs pt-2 text-right">{error}</p>
    )}

    <div className="flex flex-col gap-4 pt-6">
      {/* Title */}
      <div>
        <label className="input-label">TITLE</label>
        <input
          type="text"
          className="w-full text-xl sm:text-2xl text-slate-950 outline-none border-b border-slate-200 pb-1"
          placeholder="A day at the Great Wall"
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>

      {/* Date */}
      <DateSelector date={visitedDate} setDate={setVisitedDate} />

      {/* Image */}
      <ImageSelector
        image={storyImg}
        setImage={setStoryImg}
        handleDeleteImge={handleDeleteStoryImg}
      />

      {/* Story */}
      <div className="flex flex-col gap-2">
        <label className="input-label">STORY</label>
        <textarea
          className="w-full text-sm text-slate-950 outline-none bg-slate-50 p-3 rounded resize-none"
          placeholder="Your Story"
          rows={8}
          value={story}
          onChange={({ target }) => setStory(target.value)}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="input-label">VISITED LOCATIONS</label>
        <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
      </div>
    </div>
  </div>
);

};

export default AddEditTravelStory;
