import React, { useState } from "react";
import styled from "styled-components";

import ModalView from "../shared/ModalView";
import UserNameForm from "../UserNameForm";
import { saveGameClearUserRecord } from "../../api";
import { uuidv4 } from "../../utils/uuid";
import ContentLayout from "../shared/ContentLayout";
import GameMessage from "../shared/GameMessage";

const GameClearModalView = () => {
  const [formData, setFormData] = useState({ username: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = ({
    target: {
      name,
      value,
    },
  }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();

    saveGameClearUserRecord({ id: uuidv4(), record });
  };

  return (
    <ModalView width={1024} height={768} color="rgba(0, 0, 0, 0.3)">
      <ContentLayout>
        <GameMessage>CLEAR</GameMessage>
        <UserNameForm 
          onSubmit={handleSubmit} 
          value={formData.name} 
          onChange={handleInputChange} 
          name="username" 
        />
      </ContentLayout>
    </ModalView>
  );
};

export default GameClearModalView;
