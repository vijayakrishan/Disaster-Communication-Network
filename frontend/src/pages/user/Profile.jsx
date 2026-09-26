import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAppContext } from '../../context/AppContext';
import {
  User,
  Edit3,
  Save,
  X,
  Check
} from 'lucide-react';
import { formatIndianPhoneNumber } from '../../utils/phone';

const Profile = () => {

  const {
    currentUser,
    addSystemLog
  } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);

  const [savedSuccess, setSavedSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const emptyProfile = {
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    relationship: '',
    medicalInformation: ''
  };

  const [profile, setProfile] =
    useState(emptyProfile);

  const [tempProfile, setTempProfile] =
    useState(emptyProfile);

  // ============================================================
  // GET LOGGED-IN USER EMAIL
  // ============================================================

  const userEmail =
    currentUser?.email ||
    localStorage.getItem('email') ||
    sessionStorage.getItem('email');

  // ============================================================
  // LOAD PROFILE FROM DATABASE
  // ============================================================

  useEffect(() => {

    if (!userEmail) {
      setError(
        'Logged-in user email not found.'
      );

      setLoading(false);
      return;
    }

    const loadProfile = async () => {

      try {

        setLoading(true);
        setError('');

        console.log(
          'Loading profile for:',
          userEmail
        );

        const response = await fetch(
          `http://localhost:8083/api/users/profile/${encodeURIComponent(
            userEmail
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Profile API returned ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          'PROFILE FROM DATABASE:',
          data
        );

        const profileData = {

          fullName:
            data.fullName || '',

          email:
            data.email || userEmail,

          phone:
            formatIndianPhoneNumber(
              data.phone || ''
            ),

          dateOfBirth:
            data.dateOfBirth || '',

          gender:
            data.gender || '',

          address:
            data.address || '',

          emergencyContactName:
            data.emergencyContactName || '',

          emergencyContactNumber:
            formatIndianPhoneNumber(
              data.emergencyContactNumber || ''
            ),

          relationship:
            data.relationship || '',

          medicalInformation:
            data.medicalInformation || ''
        };

        setProfile(profileData);
        setTempProfile(profileData);

      } catch (err) {

        console.error(
          'PROFILE LOAD ERROR:',
          err
        );

        setError(
          'Unable to load profile from server.'
        );

      } finally {

        setLoading(false);

      }
    };

    loadProfile();

  }, [userEmail]);


  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = () => {

    setTempProfile({
      ...profile,

      phone:
        formatIndianPhoneNumber(
          profile.phone
        ),

      emergencyContactNumber:
        formatIndianPhoneNumber(
          profile.emergencyContactNumber
        )
    });

    setError('');
    setIsEditing(true);
  };


  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {

    setTempProfile({
      ...profile
    });

    setError('');
    setIsEditing(false);
  };


  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (
    field,
    value
  ) => {

    setTempProfile(
      prev => ({
        ...prev,
        [field]: value
      })
    );
  };


  // ============================================================
  // SAVE TO DATABASE
  // ============================================================

  const handleSave = async (e) => {

    e.preventDefault();

    if (!userEmail) {
      setError(
        'User email not found.'
      );
      return;
    }

    try {

      setSaving(true);
      setError('');

      const finalizedProfile = {

        ...tempProfile,

        phone:
          formatIndianPhoneNumber(
            tempProfile.phone
          ),

        emergencyContactNumber:
          formatIndianPhoneNumber(
            tempProfile.emergencyContactNumber
          )
      };

      console.log(
        'UPDATING PROFILE:',
        finalizedProfile
      );

      const response = await fetch(
        `http://localhost:8083/api/users/profile/${encodeURIComponent(
          userEmail
        )}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(
              finalizedProfile
            )
        }
      );

      if (!response.ok) {

        throw new Error(
          `Profile update failed: ${response.status}`
        );
      }

      const updatedData =
        await response.json();

      console.log(
        'PROFILE UPDATED IN DATABASE:',
        updatedData
      );

      const newProfile = {

        fullName:
          updatedData.fullName || '',

        email:
          updatedData.email || '',

        phone:
          formatIndianPhoneNumber(
            updatedData.phone || ''
          ),

        dateOfBirth:
          updatedData.dateOfBirth || '',

        gender:
          updatedData.gender || '',

        address:
          updatedData.address || '',

        emergencyContactName:
          updatedData.emergencyContactName || '',

        emergencyContactNumber:
          formatIndianPhoneNumber(
            updatedData.emergencyContactNumber || ''
          ),

        relationship:
          updatedData.relationship || '',

        medicalInformation:
          updatedData.medicalInformation || ''
      };

      setProfile(newProfile);
      setTempProfile(newProfile);

      setIsEditing(false);

      setSavedSuccess(true);

      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);

      if (addSystemLog) {

        addSystemLog(
          'INFO',
          `User profile updated for ${newProfile.fullName}.`
        );

      }

    } catch (err) {

      console.error(
        'PROFILE UPDATE ERROR:',
        err
      );

      setError(
        'Unable to update profile. Please try again.'
      );

    } finally {

      setSaving(false);

    }
  };


  // ============================================================
  // DISPLAY VALUES
  // ============================================================

  const values =
    isEditing
      ? tempProfile
      : profile;


  // ============================================================
  // NO USER
  // ============================================================

  if (!currentUser) {
    return null;
  }


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div className="dashboard-page">

        <div className="profile-container-shell">

          <div className="profile-card">

            <div className="profile-card-header">

              <div className="header-title-flex">

                <User
                  size={22}
                  className="title-icon"
                />

                <h2>
                  PROFILE
                </h2>

              </div>

            </div>

            <div
              style={{
                padding: '40px',
                textAlign: 'center'
              }}
            >
              Loading profile...
            </div>

          </div>

        </div>

      </div>
    );
  }


  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div className="dashboard-page">

      <div className="profile-container-shell">

        <form
          onSubmit={handleSave}
          className="profile-card"
        >

          {/* ====================================================
              HEADER
              ==================================================== */}

          <div className="profile-card-header">

            <div className="header-title-flex">

              <User
                size={22}
                className="title-icon"
              />

              <h2>
                PROFILE
              </h2>

            </div>


            <div className="header-actions">

              {!isEditing ? (

                <button
                  type="button"
                  onClick={handleEdit}
                  className="btn-edit"
                >

                  <Edit3 size={15} />

                  <span>
                    Edit
                  </span>

                </button>

              ) : (

                <div className="edit-buttons-row">

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-cancel"
                    disabled={saving}
                  >

                    <X size={15} />

                    <span>
                      Cancel
                    </span>

                  </button>


                  <button
                    type="submit"
                    className="btn-save"
                    disabled={saving}
                  >

                    <Save size={15} />

                    <span>
                      {saving
                        ? 'Saving...'
                        : 'Save'}
                    </span>

                  </button>

                </div>

              )}

            </div>

          </div>


          {/* ====================================================
              ERROR
              ==================================================== */}

          {error && (

            <div
              className="login-error"
              style={{
                margin: '20px 0'
              }}
            >
              {error}
            </div>

          )}


          {/* ====================================================
              FORM
              ==================================================== */}

          <div className="profile-form-grid">

            {/* FULL NAME */}

            <div className="form-col-50">

              <label>
                Full Name
              </label>

              <input
                type="text"
                disabled={!isEditing}
                value={values.fullName}
                onChange={(e) =>
                  handleChange(
                    'fullName',
                    e.target.value
                  )
                }
                placeholder="Full Name"
                required
              />

            </div>


            {/* EMAIL */}

            <div className="form-col-50">

              <label>
                Email
              </label>

              <input
                type="email"
                disabled={!isEditing}
                value={values.email}
                onChange={(e) =>
                  handleChange(
                    'email',
                    e.target.value
                  )
                }
                placeholder="Email Address"
                required
              />

            </div>


            {/* PHONE */}

            <div className="form-col-50">

              <label>
                Phone
              </label>

              <input
                type="text"
                disabled={!isEditing}
                value={values.phone}
                onChange={(e) =>
                  handleChange(
                    'phone',
                    e.target.value
                  )
                }
                placeholder="Phone Number"
                required
              />

            </div>


            {/* DOB */}

            <div className="form-col-50">

              <label>
                Date of Birth
              </label>

              <input
                type="text"
                disabled={!isEditing}
                value={values.dateOfBirth}
                onChange={(e) =>
                  handleChange(
                    'dateOfBirth',
                    e.target.value
                  )
                }
                placeholder="dd-mm-yyyy"
                required
              />

            </div>


            {/* GENDER */}

            <div className="form-col-50">

              <label>
                Gender
              </label>

              <select
                disabled={!isEditing}
                value={values.gender}
                onChange={(e) =>
                  handleChange(
                    'gender',
                    e.target.value
                  )
                }
                required
              >

                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>


            <div className="form-col-50-spacer"></div>


            {/* ADDRESS */}

            <div className="form-col-100">

              <label>
                Address
              </label>

              <textarea
                rows="3"
                disabled={!isEditing}
                value={values.address}
                onChange={(e) =>
                  handleChange(
                    'address',
                    e.target.value
                  )
                }
                placeholder="Residential Address"
                required
              />

            </div>


            {/* EMERGENCY NAME */}

            <div className="form-col-50">

              <label>
                Emergency Contact Name
              </label>

              <input
                type="text"
                disabled={!isEditing}
                value={
                  values.emergencyContactName
                }
                onChange={(e) =>
                  handleChange(
                    'emergencyContactName',
                    e.target.value
                  )
                }
                placeholder="Emergency Contact Name"
                required
              />

            </div>


            {/* EMERGENCY PHONE */}

            <div className="form-col-50">

              <label>
                Emergency Contact Number
              </label>

              <input
                type="text"
                disabled={!isEditing}
                value={
                  values.emergencyContactNumber
                }
                onChange={(e) =>
                  handleChange(
                    'emergencyContactNumber',
                    e.target.value
                  )
                }
                placeholder="Emergency Contact Number"
                required
              />

            </div>


            {/* RELATIONSHIP */}

            <div className="form-col-50">

              <label>
                Relationship
              </label>

              <input
                type="text"
                disabled={!isEditing}
                value={
                  values.relationship
                }
                onChange={(e) =>
                  handleChange(
                    'relationship',
                    e.target.value
                  )
                }
                placeholder="Relationship"
                required
              />

            </div>


            <div className="form-col-50-spacer"></div>


            {/* MEDICAL INFORMATION */}

            <div className="form-col-100">

              <label>
                Medical Information
              </label>

              <textarea
                rows="4"
                disabled={!isEditing}
                value={
                  values.medicalInformation
                }
                onChange={(e) =>
                  handleChange(
                    'medicalInformation',
                    e.target.value
                  )
                }
                placeholder="Any chronic conditions, allergies, or blood group details..."
                required
              />

            </div>

          </div>


          {/* ====================================================
              SUCCESS
              ==================================================== */}

          {savedSuccess && (

            <div className="profile-success-toast">

              <Check size={16} />

              <span>
                Profile Saved Successfully
              </span>

            </div>

          )}

        </form>

      </div>

    </div>
  );
};

export default Profile;