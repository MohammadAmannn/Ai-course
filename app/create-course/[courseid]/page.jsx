"use client";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/schema";
import { useUser } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import CourseBasic from "./_components/Course_basic_info";
import CourseDetails from "./_components/course_details";
import ChapterList from "./_components/Chapter_List";
import { Button } from "@/components/ui/button";
import { GenerateChapter_AI } from "@/configs/Ai_Model";
import LoadingDialog from "../Loading";
import { toast } from "sonner";

function CourseLayout({ params }) {
  // Get the authenticated user
  const { user } = useUser();
  
  // State to store the course data
  const [courses, setCourses] = React.useState(null);
  const [Loading,setLoding]=useState(false)

  // Fetch the course details when params and user are available
  useEffect(() => {
    params && user && GetCourse();
  }, [params, user]);

  // Fetch course from the database based on courseId and createdBy
  const GetCourse = async () => {
    const result = await db
      .select()
      .from(CourseList)
      .where(
        and(
          eq(CourseList.courseId, params?.courseid),
          eq(CourseList?.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
      );
    
    // Store the course in the state
    setCourses(result[0]);
    console.log(result);
  };

  // Function to dynamically generate the AI prompt for each chapter
  const GenerateChapter = () => {
    setLoding(true)
    if (!courses || !courses.courseOutput?.chapters) return;

    // Loop through each chapter in the course
    courses.courseOutput.chapters.forEach(async(chapter, index) => {
      const PROMPT = `Explain the concept in detail on topic: ${courses?.name}, chapter ${index + 1}: ${chapter.name}. ` +
        "Provide the explanation in JSON format with list of array with fields like title, explanation (detailed), and code example (code field in <precode> format) if applicable.";

      console.log(PROMPT);
      // You can make the API call here with the generated prompt to the AI service
      if (index<3) {
        try {
          const result=await GenerateChapter_AI.sendMessage (PROMPT)
          console.log(result)
          console.log(result?.response?.text())
          setLoding(false)
          toast("Hurray Course Is Ready")
        //Genrate Video URL

          
        } catch (error) {
          setLoding(false)
          console.error(error);
          
        }
        
      }
    });
  };

  return (
    <div className="mt-10 px-7 md:px-20 lg:px-44">
      <h2 className="font-bold text-center text-2xl">Course Layout</h2>
      <LoadingDialog loading={Loading}/>

      {/* Display course basic information */}
      {courses ? <CourseBasic course={courses} /> : <p>Loading course details...</p>}

      {/* Display course details */}
      {courses && <CourseDetails course={courses} />}

      {/* Display list of chapters */}
      {courses && <ChapterList course={courses} />}

      {/* Button to generate the AI-based chapter explanation */}
      <Button className="my-10" onClick={GenerateChapter}>
        Generate Course
      </Button>
    </div>
  );
}

export default CourseLayout;
