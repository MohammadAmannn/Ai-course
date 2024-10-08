"use client";
import { db } from "@/configs/db";
import { Chapters, CourseList } from "@/configs/schema";
import { and, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import ChapterListCard from "./_components/ChapterListCard";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import Chaptercontent from "./_components/Chapter_content";
import YouTube from "react-youtube";

const CourseStart = ({ params }) => {
  const [course, setCourse] = useState(null); // Initialize as null
  const [selectedChapter, setSelectedChapter] = useState(null); // Track selected chapter
  const [chapterContent, setChapterContent] = useState(null); // Track chapter content
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Toggle for sidebar

  useEffect(() => {
    if (params?.courseId) {
      GetCourse(); // Fetch course data when params are available
    }
  }, [params]);

  // Fetch course details
  const GetCourse = async () => {
    try {
      const result = await db
        .select()
        .from(CourseList)
        .where(eq(CourseList?.courseId, params?.courseId));
      
      console.log("Fetched Course Data:", result); // Log the full course data
      setCourse(result[0]);

      // Automatically select the first chapter and fetch its content
      const firstChapter = result[0]?.courseOutput?.chapters[0]; // Adjusted based on structure
      if (firstChapter) {
        setSelectedChapter(firstChapter); // Set first chapter
        GetSelectedChapterContent(firstChapter?.chapterId); // Fetch full content of the first chapter
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  // Fetch selected chapter content
  const GetSelectedChapterContent = async (chapterId) => {
    try {
      const result = await db
        .select()
        .from(Chapters)
        .where(
          and(
            eq(Chapters?.chapterId, chapterId),
            eq(Chapters?.courseId, course?.courseId)
          )
        );

      console.log("Fetched Chapter Content:", result);
      setChapterContent(result[0]); // Set chapter content
    } catch (error) {
      console.error("Error fetching chapter content:", error);
    }
  };

  const opts = {
    height: '300',
    width: '600',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
    },
}

  return (



    
    <div>


{/* <YouTube
      videoId={content?.videoId}
      opts={opts}

      /> */}

      {/* Toggle button for sidebar on mobile */}
      <div className="md:hidden p-4">
        <button
          className="bg-primary text-white p-2 rounded-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <Cross1Icon className="w-6 h-6" />
          ) : (
            <HamburgerMenuIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Chapters list sidebar */}
      <div
        className={`fixed md:w-64 w-64 h-screen bg-white border-r shadow-sm z-20 transform transition-transform md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:block`}
      >
        <h2 className="font-medium text-lg bg-primary p-3 text-white">
          {course?.courseOutput?.courseName} {/* Ensure this matches the actual structure */}
        </h2>

        <div className="h-[calc(100%-3rem)] overflow-y-auto">
          {course?.courseOutput?.chapters?.map((chapter, index) => (
            <div
              key={index}
              className={`cursor-pointer hover:bg-purple-50 ${
                selectedChapter.name==chapter?.name&&
                "bg-purple-200"
              }`}
              onClick={() => {
                setSelectedChapter(chapter);
                GetSelectedChapterContent(index); // Pass correct chapterId
              }}
            >
              <ChapterListCard chapter={chapter} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Content of each chapter */}
      <div className="md:ml-64">
         
          <Chaptercontent chapter={selectedChapter} content={chapterContent} />
         
        
      </div>

      {/* Overlay to close the sidebar when clicking outside on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default CourseStart;
