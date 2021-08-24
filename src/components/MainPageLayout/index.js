import React from "react";
import styled from "styled-components";

import trees from "../../../public/trees.png";
import PageWrapper from "../shared/PageWrapper";

const MainPageLayout = ({ children }) => {
  return (
    <PageWrapper color="#F0E7DC">
      {/* <Trees isTop={true} /> */}
        {children}
      {/* <Trees isTop={false} /> */}
    </PageWrapper>
  );
};

const Trees = styled.div`
  position: fixed;
  top: ${({ isTop }) => isTop && 0};
  bottom: ${({ isTop }) => !isTop && 0};
  width: 100%;
  height: 10%;
  background: url(${trees}) 0px 0px;
  background-repeat: repeat-y;
`;

export default MainPageLayout;
