import { useState } from "react";
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  Avatar,
  AvatarGroup,
  useBreakpointValue,
  IconProps,
  Icon,
  InputGroup,
  InputAddon,
  InputRightAddon,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

export default function SubmitGoalForm() {
  //    const {  } =  useWeb3React();

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [stake, setStake] = useState("");
  const [supervisor, setSupervisor] = useState("");

  const submitGoal = () => {
    console.log(title, deadline, stake, supervisor);
  };
  return (
    <Box>
      <Stack
        bg={"gray.50"}
        rounded={"xl"}
        p={{ base: 4, sm: 6, md: 8 }}
        spacing={{ base: 8 }}
        maxW={{ lg: "lg" }}
      >
        <Stack spacing={4}>
          <Heading
            color={"gray.800"}
            lineHeight={1.1}
            fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
          >
            I want to...
          </Heading>
        </Stack>
        <Box as={"form"} mt={10}>
          <Stack spacing={4}>
            <Input
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ship a dapp"
              bg={"gray.100"}
              border={0}
              color={"gray.500"}
              _placeholder={{
                color: "gray.500",
              }}
            />
            <Input
              onChange={(e) => setDeadline(e.target.value)}
              type="date"
              placeholder=""
              bg={"gray.100"}
              border={0}
              color={"gray.500"}
              _placeholder={{
                color: "gray.500",
              }}
            />
            <InputGroup>
              <Input
                onChange={(e) => setStake(e.target.value)}
                placeholder="100"
                bg={"gray.100"}
                border={0}
                color={"gray.500"}
                _placeholder={{
                  color: "gray.500",
                }}
              />
              <InputRightAddon
                bg={"gray.100"}
                border={0}
                color={"gray.500"}
                _placeholder={{
                  color: "gray.500",
                }}
              >
                MATIC
              </InputRightAddon>
            </InputGroup>
            <Input
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Supervisor Address"
              bg={"gray.100"}
              border={0}
              color={"gray.500"}
              _placeholder={{
                color: "gray.500",
              }}
            />
          </Stack>
          <Button
            onClick={submitGoal}
            fontFamily={"heading"}
            mt={8}
            w={"full"}
            bgGradient="linear(to-r, red.400,pink.400)"
            color={"white"}
            _hover={{
              bgGradient: "linear(to-r, red.400,pink.400)",
              boxShadow: "xl",
            }}
          >
            Stake
          </Button>
        </Box>
        form
      </Stack>
    </Box>
  );
}
