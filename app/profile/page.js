"use client"; // This makes the file a client component

import React, { useState, useEffect, useRef } from "react";
import { auth } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import axios from "axios";
import DashboardComponent from "../dashboard/page";

export default function Dashboard() {
  const [userData, setUserData] = useState({
    name: "",
    bio: "",
    profilePhoto: "",
    work: "",
    gender: "",
    dob: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const user = auth.currentUser;
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.error("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchData();
    }
  }, [user]);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "myUploadPreset");
    formData.append("cloud_name", "dlil6t6m4");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dlil6t6m4/image/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
            }
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary: ", error);
      throw new Error("Image upload failed. Please try again.");
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let profilePhotoUrl = userData.profilePhoto;
      if (file) {
        profilePhotoUrl = await uploadImageToCloudinary(file);
      }
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        ...userData,
        profilePhoto: profilePhotoUrl,
      });
      setUserData((prevData) => ({
        ...prevData,
        profilePhoto: profilePhotoUrl,
      }));
      alert("Profile updated successfully!");
      setIsEditing(false);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert("There was an error saving the profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid image file.");
      setFile(null);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert("You have been logged out.");
      window.location.href = "/auth"; // Adjust the path as needed
    } catch (error) {
      console.error("Error logging out:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      {/* Sidebar */}
      <div
        className="w-16 h-16 rounded-full flex justify-center items-center cursor-pointer mt-6 ml-6 bg-white shadow-lg border border-gray-200 transition-all md:w-20 md:h-20 lg:w-24 lg:h-24"
        onClick={() => setIsProfileVisible(!isProfileVisible)}
      >
        {userData.profilePhoto ? (
          <img
            src={userData.profilePhoto}
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover md:w-16 md:h-16 lg:w-20 lg:h-20"
          />
        ) : (
          <div className="w-14 h-14 bg-blue-500 rounded-full flex justify-center items-center text-white text-xl md:w-16 md:h-16 lg:w-20 lg:h-20">
            👤
          </div>
        )}
</div>
<h1
  className="absolute bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-2xl md:text-4xl lg:text-5xl font-extrabold px-6 py-3 rounded-lg shadow-lg"
  style={{
    left: "50%",
    transform: "translateX(-50%)",
    textShadow: "2px 4px 6px rgba(0, 0, 0, 0.3)",
    animation: "pulse 2s infinite",
  }}
>
  Talecademy
  
</h1>

<style>
  {`
    @keyframes pulse {
      0%, 100% {
        transform: translateX(-50%) scale(1);
      }
      50% {
        transform: translateX(-50%) scale(1.1);
      }
    }
  `}
</style>


      

      {/* Main Content */}
      <div
        className={`flex flex-col md:flex-row w-full p-4 sm:p-6 lg:p-10   transition-all ${
          isProfileVisible ? "md:w-4/4" : "md:w-full"
        }`}
      >
        {isProfileVisible && (
          <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-6 w-full sm:w-2/3 md:w-1/3 lg:w-1/4 mt-6 md:mt-0 md:mr-6">
            <h1 className="text-3xl font-semibold text-gray-800">Profile</h1>

            <div className="flex justify-center items-center">
              {userData.profilePhoto ? (
                <img
                  src={userData.profilePhoto}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg cursor-pointer hover:opacity-80"
                  onClick={() => fileInputRef.current.click()}
                />
              ) : (
                <div
                  className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="text-white text-xl font-semibold">
                    No Photo
                  </span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {isEditing ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-900 font-medium text-lg">
                      Profile Photo
                    </label>
                  </div>
                  {[
                    { label: "Name", value: userData.name, type: "text" },
                    { label: "Bio", value: userData.bio, type: "textarea" },
                    { label: "Work", value: userData.work, type: "text" },
                    {
                      label: "Gender",
                      value: userData.gender,
                      type: "select",
                      options: ["Male", "Female", "Other"],
                    },
                    { label: "DOB", value: userData.dob, type: "date" },
                  ].map((field, index) => (
                    <div key={index}>
                      <label className="block text-gray-900 font-medium text-lg">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={field.value}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              [field.label.toLowerCase()]: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                          rows="4"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={field.value}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              [field.label.toLowerCase()]: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option, idx) => (
                            <option key={idx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={field.value}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              [field.label.toLowerCase()]: e.target.value,
                            })
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}

                <button
                  onClick={handleUpdateProfile}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg mt-4 font-semibold hover:shadow-lg hover:scale-105 transition-transform"
                  disabled={loading || !userData.name || !userData.bio}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="text-left text-lg font-semibold text-gray-800">
                  Name: <span className="text-gray-500">{userData.name}</span>
                </div>
                <div className="text-left text-lg font-semibold text-gray-800">
                  Bio: <span className="text-gray-500">{userData.bio}</span>
                </div>
                <div className="text-left text-lg font-semibold text-gray-800">
                  Work: <span className="text-gray-500">{userData.work}</span>
                </div>
                <div className="text-left text-lg font-semibold text-gray-800">
                  Gender:{" "}
                  <span className="text-gray-500">{userData.gender}</span>
                </div>
                <div className="text-left text-lg font-semibold text-gray-800">
                  DOB: <span className="text-gray-500">{userData.dob}</span>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-lg mt-4 font-semibold hover:shadow-lg"
                >
                  Edit Profile
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-3 rounded-lg mt-4 font-semibold hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Content */}
        <div className="w-full">
          <DashboardComponent />
        </div>
      </div>
    </div>
  );
}
