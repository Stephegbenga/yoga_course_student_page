import {useEffect, useState} from "react";

function App() {
  const default_course = {
    name: "Introduction to Programming",
    description: "A comprehensive course covering the basics of programming",
    sections: [
      {
        title: "Getting Started",
        items: [
          {id:"1", type: "video", url: "intro.mp4", title: "Course Overview"},
          {id:"2",type: "pdf", url: "syllabus.pdf", title: "Course Syllabus"},
        ],
      },
      {
        title: "Basic Concepts",
        items: [
          {id:"3",type: "video", url: "variables.mp4", title: "Variables and Data Types"},
          {id:"4",type: "pdf", url: "operators.pdf", title: "Operators and Expressions"},
          {id:"5",type: "video", url: "control_flow.mp4", title: "Control Flow Statements"},
        ],
      },
      {
        title: "Functions and Objects",
        items: [
          {id:"6",type: "video", url: "functions.mp4", title: "Introduction to Functions"},
          {id:"7",type: "pdf", url: "objects.pdf", title: "Object-Oriented Programming"},
          {id:"8",type: "video", url: "classes.mp4", title: "Classes and Inheritance"},
        ],
      },
      {
        title: "Advanced Topics",
        items: [
          {id: "10", type: "video", url: "async.mp4", title: "Asynchronous Programming"},
          {id:"11",type: "pdf", url: "error_handling.pdf", title: "Error Handling and Debugging"},
          {id: "12", type: "video", url: "apis.mp4", title: "Working with APIs"},
        ],
      },
    ],
  }


  const [loading, setLoading] = useState(false);


  const [selected_tab, setSelected_tab] = useState(default_course.sections[0].items[0]);
  const [course, setCourse] = useState(default_course);

  const [activeIndex, setActiveIndex] = useState(null);

  function toggleActiveIndex(index) {
    setActiveIndex(activeIndex === index ? null : index);
  }

  function handleTabClick(item, selection_index){
    setSelected_tab(item)
    setActiveIndex(selection_index)
  }

  return (
    <div className="main_body">
      <div className="course-header">
        <h4>{course.name}</h4>
      </div>


      <div className="course_content_container">
        {selected_tab.type === "video" ? (
          <video controls className="course_content_video">
            <source src="https://d30yihluwpc648.cloudfront.net/video_file_manager/Detox%20yoga.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex column align-center justify-center course_content_video">
            <p>Download and review the PDF provided by your instructor for this lecture.</p>
            <button className="btn bottom-action-btn margin-top-20">
              <i className="fa fa-download margin-right-10"></i>
              Download PDF
            </button>
          </div>
        )}
      </div>

      <div className="flex align-center justify-center w-f">
        <h2>Course Content</h2>
      </div>

      <div className="course_content_sub_container">
        {course.sections.map((section, section_index) => (
          <div key={section_index} onClick={() => toggleActiveIndex(section_index)} className="course-content-item">
            <div className="course-content-head">
              <h4>
                Section {section_index + 1}: {section.title}
              </h4>
              <i className={activeIndex === section_index ? "fa fa-angle-up" : "fa fa-angle-down"} style={{fontSize: "24px"}} aria-hidden="true"></i>
            </div>

            <div className={`course-content-item-content ${activeIndex === section_index ? "visible" : ""}`}>
              {section.items.map((item, section_item_index) => (
                <div 
                  key={section_item_index} 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling up
                    handleTabClick(item, section_index);
                  }} 
                  className={`course-section-item ${selected_tab.id === item.id ? "active" : ""}`}
                >
                  <span className="text-md">
                    {section_item_index + 1}. {item.title}
                  </span>

                  <div className="flex align-center align-center gap-5">
                    <i className={item.type === "video" ? "fa-brands fa-youtube" : "fa-regular fa-file"}></i>
                    <span className="text-small">1 min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;
