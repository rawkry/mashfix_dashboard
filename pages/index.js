import { Row } from "react-bootstrap";

import { Main } from "@/layouts";
import Chart from "@/resuable/chart";
import getMyProfile from "@/helpers/server/getMyProfile";

// const { url_one, url_two, headers } = JSON.parse(
//   process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
// );

export async function getServerSideProps(context) {
  const myProfile = await getMyProfile(context);

  return {
    props: {
      myProfile,
    },
  };
}

export default function Index({ myProfile }) {
  return (
    <Main icon="fas fa-columns" title="Dashboard" profile={myProfile}>
      <div className="mt-3">
        <Row>
          {/* <Chart
            Activebusinesses={Activebusinesses.total}
            InActiveBusiness={InActiveBusiness.total}
            applicants={applicants.total}
            users={users.total}
            admins={admins.total}
          /> */}
        </Row>
      </div>
    </Main>
  );
}
