import { redirect } from "next/navigation";

const Profile = () => {
  // Redirect to the default profile page (saved matches)
  redirect("/profile/saved-match");
};

export default Profile;
