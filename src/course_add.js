import {useState, useEffect} from "react";

function App() {
  const [courses, setCourses] = useState([]);

  const [section, setSection] = useState("list");
  const [search_text, setSearch_text] = useState("");

  const empty_video = {title: "", url: "", thumbnail_img: ""};
  const empty_file = {title: "", url: ""};
  const empty_section = {title: "", section_items: []};
  const empty_quiz = {title: "", quizzes: []};
  const single_empty_quiz = {question: "", options: [{text: "correct answer here", isCorrect: true}, {text: ""}, {text: ""}, {text: ""}]};

  const [new_course, setNew_course] = useState({name: "", description: "", price: 0.0});
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      let result = await getCourses();

      if (result && result.status === "success") {
        setCourses(
          result.courses.map((course) => ({
            ...course,
            sections: JSON.parse(course.sections),
          }))
        );
      }

    };

    fetchCourses();
  }, []);


  function handleSectionChange(section) {
    setSection(section);
  }

  function addSection() {
    setSections([...sections, {id: uniqueId(), ...empty_section}]);
  }

  function addSectionItem(section_index, type) {
    const updatedSections = [...sections];
    if (type === "video") {
      updatedSections[section_index].section_items.push({...empty_video, id: uniqueId(), type: "video"});
    }

    if (type === "quiz") {
      let new_single_empty_quiz = {...single_empty_quiz, id: uniqueId()};
      updatedSections[section_index].section_items.push({
        ...empty_quiz,
        type: "quiz",
        quizzes: [new_single_empty_quiz],
        selected_quiz: new_single_empty_quiz,
      });
    }

    if (type === "pdf") {
      updatedSections[section_index].section_items.push({...empty_file, id: uniqueId(), type: "pdf"});
    }

    setSections(updatedSections);
  }

  function removeSectionItem(section_index, section_item_index) {
    const updatedSections = [...sections];
    updatedSections[section_index].section_items.splice(section_item_index, 1);
    setSections(updatedSections);
  }

  function deleteSection(index) {
    setSections(sections.filter((_, i) => i !== index));
  }

  async function getCourses() {
    const formData = new FormData();
    formData.append("action", "get_courses");

    try {
      const response = await fetch("https://www.yogafromtheheart.live/wp-admin/admin-ajax.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function saveCourse() {
    let data = {
      ...new_course,
      id: new_course.id || uniqueId(),
      sections: JSON.stringify(sections),
    };

    console.log(data);
    setNew_course(data);

    const formData = new FormData();
    formData.append("id", data.id);
    formData.append("action", "update_course");
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("sections", data.sections);
    formData.append("price", data.price);

    console.log("Daa ", formData);

    try {
      const response = await fetch("https://www.yogafromtheheart.live/wp-admin/admin-ajax.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status == "success") {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function uniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function addQuiz(section_index, section_item_index) {
    const updatedSections = sections.map((section, i) => {
      if (i === section_index) {
        return {
          ...section,
          section_items: section.section_items.map((item, j) => {
            if (j === section_item_index && item.type === "quiz") {
              return {
                ...item,
                quizzes: [
                  ...item.quizzes,
                  {
                    id: uniqueId(),
                    ...single_empty_quiz,
                  },
                ],
              };
            }
            return item;
          }),
        };
      }
      return section;
    });

    console.log(updatedSections);
    setSections(updatedSections);
  }

  function deleteQuiz(section_index, section_item_index, quiz_index) {
    const updatedSections = sections.map((section, i) => {
      if (i === section_index) {
        return {
          ...section,
          section_items: section.section_items.map((item, j) => {
            if (j === section_item_index && item.type === "quiz") {
              return {
                ...item,
                quizzes: item.quizzes.filter((_, k) => k !== quiz_index),
              };
            }
            return item;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  }

  function changeQuiz(section_index, section_item_index, direction) {
    const updatedSections = sections.map((section, i) => {
      if (i === section_index) {
        return {
          ...section,
          section_items: section.section_items.map((item, j) => {
            if (j === section_item_index && item.type === "quiz") {
              let new_selected_quiz_index = item.quizzes.findIndex((quiz) => quiz.id === item.selected_quiz.id) + direction;
              if (new_selected_quiz_index >= 0 && new_selected_quiz_index < item.quizzes.length) {
                return {
                  ...item,
                  selected_quiz: item.quizzes[new_selected_quiz_index],
                };
              }
            }
            return item;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  }

  function changeQuizQuestion(section_index, section_item_index, question) {
    const updatedSections = sections.map((section, i) => {
      if (i === section_index) {
        return {
          ...section,
          section_items: section.section_items.map((item, j) => {
            if (j === section_item_index && item.type === "quiz") {
              return {
                ...item,
                quizzes: item.quizzes.map((quiz, k) => {
                  if (k === item.quizzes.findIndex((q) => q.id === item.selected_quiz.id)) {
                    return {
                      ...quiz,
                      question: question,
                    };
                  }
                  return quiz;
                }),
                selected_quiz: {
                  ...item.selected_quiz,
                  question: question,
                },
              };
            }
            return item;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  }

  function changeQuizOption(section_index, selected_quiz_id, option_index, text) {
    const updatedSections = sections.map((section, i) => {
      if (i === section_index) {
        return {
          ...section,
          section_items: section.section_items.map((item, j) => {
            if (item.type === "quiz") {
              const updatedItem = {
                ...item,
                quizzes: item.quizzes.map((quiz) => {
                  if (quiz.id === selected_quiz_id) {
                    return {
                      ...quiz,
                      options: quiz.options.map((option, l) => {
                        if (l === option_index) {
                          return {
                            ...option,
                            text: text,
                          };
                        }
                        return option;
                      }),
                    };
                  }
                  return quiz;
                }),
              };
              if (updatedItem.selected_quiz.id === selected_quiz_id) {
                updatedItem.selected_quiz = {
                  ...updatedItem.selected_quiz,
                  options: updatedItem.selected_quiz.options.map((option, l) => {
                    if (l === option_index) {
                      return {
                        ...option,
                        text: text,
                      };
                    }
                    return option;
                  }),
                };
              }
              return updatedItem;
            }
            return item;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  }

  return (
    <div className="main_body">
      <div className="head">
        <h3>Courses</h3>

        <div className="btn-group">
          <button className="btn" onClick={() => handleSectionChange("add")}>
            Add New Course
          </button>
          <button className="btn" onClick={() => handleSectionChange("list")}>
            List
          </button>
        </div>
      </div>

      {section == "list" && (
        <div className="flex column list-section">
          <div className="flex gap-10 align-center justify-space-between margin-top-20">
            <input value={search_text} onChange={(e) => setSearch_text(e.target.value)} placeholder="Search By Course Name" className="flex flex-1 search-input" />

            <select className="flex flex-1 search-input">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="btn-group">
              <button className="btn">Search</button>
              <button className="btn">Reset</button>
            </div>
          </div>

          <table class="bordered-table">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                return (
                  <tr>
                    <td></td>
                    <td>{course.name}</td>
                    <td>{course.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {section == "add" && (
        <div className="flex column add-section padding-10">
          <div className="flex column margin-top-20">
            <div className="flex row gap-10 w-f">
              <div className="flex flex-1 column">
                <h4>Course Name</h4>
                <input value={new_course.name} onChange={(e) => setNew_course({...new_course, name: e.target.value})} placeholder="Enter Course Name" className="search-input" />
              </div>

              <div className="flex flex-1 column">
                <h4>Course Description</h4>
                <input value={new_course.description} onChange={(e) => setNew_course({...new_course, description: e.target.value})} placeholder="Enter Course Description" className="search-input" />
              </div>
            </div>

            {sections.map((section, section_index) => {
              return (
                <div key={section_index} className="video-card flex column">
                  <div className="flex column padding-10">
                    <div className="flex row align-center justify-space-between padding-10">
                      <div className="flex align-center">
                        <h4>Chapter {section_index + 1}</h4>
                        <input className="course-title-input" placeholder="Enter Chapter Title" onChange={(e) => (sections[section_index].title = e.target.value)} />
                      </div>

                      <button onClick={() => deleteSection(section_index)} className="btn btn-danger">
                        Delete
                      </button>
                    </div>

                    {section.section_items.map((section_item, section_item_index) => {
                      if (section_item.type === "video") {
                        return (
                          <div key={section_item + "-" + section_item_index} className="section-card">
                            <div className="flex align-top justify-space-between">
                              <div className="flex align-center margin-bottom-20">
                                <span className="text-md margin-bottom-10">Lesson {section_item_index + 1}. (Video File)</span>
                                <input className="lesson_title_input margin-left-10" type="text" placeholder="Enter lesson title" onChange={(e) => (section.section_items[section_item_index].title = e.target.value)} />
                              </div>

                              <a onClick={() => removeSectionItem(section_index, section_item_index)} className="cursor-pointer">
                                <i className="fa fa-trash text-danger" aria-hidden="true"></i>
                              </a>
                            </div>

                            <div className="flex row gap-10 padding-10">
                              <div className="flex flex-1 column">
                                <span>Video File</span>

                                <div className="video-input">
                                  {/* removed this will add soon */}
                                  {/* <input type="file" /> */}

                                  {/* Video url input */}
                                  <input placeholder="Enter video url" onChange={(e) => (section.section_items[section_item_index].url = e.target.value)} />
                                </div>
                              </div>

                              <div className="flex flex-1 column">
                                <span>Thumbnail Photo Size(1000px * 640px)</span>

                                <div className="video-input">
                                  {/* <input placeholder="Thumbai" type="file" /> */}
                                  <input placeholder="Enter thumbnail url" onChange={(e) => (section.section_items[section_item_index].thumbnail_img = e.target.value)} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (section_item.type === "pdf") {
                        return (
                          <div key={section_item + "-" + section_item_index} className="section-card">
                            <div className="flex align-top justify-space-between">
                              <div className="flex align-center margin-bottom-20">
                                <span className="text-md">Lesson {section_item_index + 1}. (Pdf)</span>
                                <input className="lesson_title_input margin-left-10" type="text" placeholder="Enter lesson title" onChange={(e) => (section.section_items[section_item_index].title = e.target.value)} />
                              </div>

                              <a onClick={() => removeSectionItem(section_index, section_item_index)} className="cursor-pointer">
                                <i className="fa fa-trash text-danger" aria-hidden="true"></i>
                              </a>
                            </div>

                            <div className="flex align-center justify-center">
                              <div className="video-input w-f align-center justify-center">
                                <input type="file" />
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (section_item.type === "quiz") {
                        return (
                          <div key={section_item + "-" + section_item_index} className="section-card">
                            <div className="flex align-top justify-space-between">
                              <div className="flex align-center margin-bottom-20">
                                <span className="text-md">Lesson {section_item_index + 1}. (Quiz)</span>
                                <input className="lesson_title_input margin-left-10" type="text" placeholder="Enter lesson title" onChange={(e) => (section.section_items[section_item_index].title = e.target.value)} />
                              </div>

                              <a onClick={() => removeSectionItem(section_index, section_item_index)} className="cursor-pointer">
                                <i className="fa fa-trash text-danger" aria-hidden="true"></i>
                              </a>
                            </div>

                            <div className="quiz-actions-container">
                              <div>
                                <span>
                                  Quiz {section_item.quizzes.findIndex((quiz) => quiz.id === section_item.selected_quiz.id) + 1} of {section_item.quizzes.length}
                                </span>
                              </div>

                              <div>
                                <button onClick={() => changeQuiz(section_index, section_item_index, -1)} disabled={section_item.quizzes.findIndex((quiz) => quiz.id === section_item.selected_quiz.id) === 0} className="btn margin-right-8">
                                  <i className="fa fa-chevron-left"></i> Prev
                                </button>

                                <button onClick={() => changeQuiz(section_index, section_item_index, 1)} disabled={section_item.quizzes.findIndex((quiz) => quiz.id === section_item.selected_quiz.id) === section_item.quizzes.length - 1} className="btn">
                                  Next <i className="fa fa-chevron-right"></i>
                                </button>
                              </div>

                              <div>
                                <button onClick={() => addQuiz(section_index, section_item_index)} className="btn margin-right-8">
                                  <i className="fa fa-plus"></i> Add Quiz
                                </button>
                                <button
                                  onClick={() =>
                                    deleteQuiz(
                                      section_index,
                                      section_item_index,
                                      section_item.quizzes.findIndex((quiz) => quiz.id === section_item.selected_quiz.id)
                                    )
                                  }
                                  className="btn btn-danger"
                                  disabled={section_item.quizzes.length <= 1}
                                >
                                  <i className="fa fa-trash"></i> Delete Quiz
                                </button>
                              </div>
                            </div>

                            {section_item.selected_quiz && (
                              <div key={section_item.id} className="flex column">
                                <div className="quiz-question">
                                  <textarea value={section_item.selected_quiz.question} onChange={(e) => changeQuizQuestion(section_index, section_item_index, e.target.value)} className="w-f" placeholder="Enter your question here"></textarea>
                                </div>

                                <div className="quiz-answers">
                                  {section_item.selected_quiz.options.map((option, option_index) => {
                                    return (
                                      <div key={section_item + "-" + section_item.selected_quiz.id + "-" + option_index} className="quiz-answer-item">
                                        <input value={option.text} onChange={(e) => changeQuizOption(section_index, section_item.selected_quiz.id, option_index, e.target.value)} placeholder={`answer ${option_index + 1}`} type="text" />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <span className="margin-top-20">Note: The correct answer should always be input in the first option i.e (answer 1)</span>
                          </div>
                        );
                      }

                      return null; // Handle any other types of section items
                    })}

                    {/* THe Drop down button to Delete Items here */}
                    <div className="dropdown-container">
                      <div className="dropdown">
                        <button className="dropdown-button margin-top-40 btn">
                          Add Lesson
                          <i className="fa fa-caret-down margin-left-10"></i>
                        </button>

                        <div className="dropdown-content">
                          <a onClick={() => addSectionItem(section_index, "video")} href="#">
                            Add Video
                          </a>
                          <a onClick={() => addSectionItem(section_index, "pdf")} href="#">
                            Add PDF
                          </a>
                          <a onClick={() => addSectionItem(section_index, "quiz")} href="#">
                            Add Quiz
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex align-center justify-center w-f">
              <button onClick={addSection} className="margin-top-40 btn">
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="display flex justify-end gap-10 padding-10">
        <button onClick={saveCourse} className="bottom-action-btn">
          Submit
        </button>
        <button className="bottom-action-btn">Cancel</button>
      </div>
    </div>
  );
}

export default App;
