// src/components/common/AllCourses.jsx
import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "./AxiosInstance";
import { Button, Modal, Form } from "react-bootstrap";
import { UserContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { MDBCol, MDBInput, MDBRow } from "mdb-react-ui-kit";

/* helper: true if price is numeric & >0 */
const isPaid = (price) => {
  const num = parseFloat(String(price ?? "").replace(/[^\d.]/g, ""));
  return !isNaN(num) && num > 0;
};

const AllCourses = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useContext(UserContext);

  /* ------------ state ------------- */
  const [courses, setCourses] = useState([]);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("");      // '', 'Paid', 'Free'
  const [show, setShow]       = useState([]);      // modal visibility
  const [card, setCard]       = useState({
    cardholdername: "",
    cardnumber: "",
    cvvcode: "",
    expmonthyear: "",
  });

  /* ------------ fetch once ------------- */
  useEffect(() => {
    axiosInstance
      .get("/api/user/getallcourses")
      .then((res) => {
        if (res.data.success) {
          setCourses(res.data.data);
          setShow(Array(res.data.data.length).fill(false));
        }
      })
      .catch(console.error);
  }, []);

  /* ------------ card input handler ------------- */
  const handleCard = (e) => {
    let { name, value } = e.target;
    if (name === "cardholdername") value = value.replace(/[^A-Za-z\s]/g, "");
    setCard({ ...card, [name]: value });
  };

  /* ------------ enroll, then navigate ------------- */
  const enroll = async (id, title, body = {}) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/user/enrolledcourse/${id}`,
        body
      );
      if (data.success) {
        alert(data.message);
        navigate(`/courseSection/${id}/${title}`);
      } else {
        alert(data.message || "Already enrolled");
      }
    } catch (err) {
      console.error("ENROLL ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  /* ------------ modal helpers ------------- */
  const open  = (i) => setShow((p) => { const a=[...p]; a[i]=true;  return a; });
  const close = (i) => setShow((p) => { const a=[...p]; a[i]=false; return a; });

  /* ------------ filtered list ------------- */
  const list = courses
    .filter((c) =>
      search === ""
        ? true
        : (c.C_title ?? "")
            .toLowerCase()
            .includes(search.toLowerCase().trim())
    )
    .filter((c) =>
      filter === "Paid" ? isPaid(c.C_price) :
      filter === "Free" ? !isPaid(c.C_price) :
      true
    );

  /* ------------ UI ------------- */
  return (
    <>
      {/* search + dropdown */}
      <div className="mt-4 filter-container text-center">
        <input
          type="text"
          placeholder="Search title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Paid">Paid</option>
          <option value="Free">Free</option>
        </select>
      </div>

      {/* cards */}
      <div className="p-2 course-container">
        {list.length === 0 && <p>No courses found</p>}
        {list.map((c, idx) => (
          <div key={c._id} className="course">
            <div className="card1">
              <div className="desc">
                <h3>{c.C_title}</h3>
                <p>{c.C_categories}</p>
                <p>{isPaid(c.C_price) ? `₹${c.C_price}` : "Free"}</p>
              </div>

              <div className="details">
                <div className="center">
                  <p>Sections: {c.sections.length}</p>

                  {userLoggedIn ? (
                    <>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() =>
                          isPaid(c.C_price)
                            ? open(idx)                    // paid → modal
                            : enroll(c._id, c.C_title)     // free → direct
                        }
                      >
                        Start Course
                      </Button>

                      {/* payment modal */}
                      <Modal show={show[idx] || false} onHide={() => close(idx)}>
                        <Modal.Header closeButton>
                          <Modal.Title>Pay for {c.C_title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Form
                            onSubmit={(e) => {
                              e.preventDefault();
                              enroll(c._id, c.C_title, card);
                            }}
                          >
                            <MDBInput
                              label="Card Holder Name"
                              name="cardholdername"
                              value={card.cardholdername}
                              onChange={handleCard}
                              pattern="[A-Za-z\s]+"
                              title="Only letters and spaces"
                              required
                              className="mb-2"
                            />
                            <MDBInput
                              label="Card Number"
                              name="cardnumber"
                              value={card.cardnumber}
                              onChange={handleCard}
                              type="number"
                              maxLength="16"
                              required
                              className="mb-2"
                            />
                            <MDBRow className="mb-4">
                              <MDBCol md="6">
                                <MDBInput
                                  label="MM/YYYY"
                                  name="expmonthyear"
                                  value={card.expmonthyear}
                                  onChange={handleCard}
                                  required
                                />
                              </MDBCol>
                              <MDBCol md="6">
                                <MDBInput
                                  label="CVV"
                                  name="cvvcode"
                                  value={card.cvvcode}
                                  onChange={handleCard}
                                  type="number"
                                  maxLength="3"
                                  required
                                />
                              </MDBCol>
                            </MDBRow>
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="secondary"
                                className="mx-2"
                                onClick={() => close(idx)}
                              >
                                Close
                              </Button>
                              <Button variant="primary" type="submit">
                                Pay Now
                              </Button>
                            </div>
                          </Form>
                        </Modal.Body>
                      </Modal>
                    </>
                  ) : (
                    <Link to="/login">
                      <Button variant="outline-dark" size="sm">
                        Start Course
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AllCourses;
