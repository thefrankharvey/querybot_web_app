import { redirect } from "next/navigation";

const Profile = () => {
  // Redirect to the default profile page (latest blog)
  redirect("/profile/latest-blog");
};

export default Profile;
