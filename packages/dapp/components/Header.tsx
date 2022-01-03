import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  Container,
} from "@chakra-ui/react";
import Web3Modal from "web3modal";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useWeb3React } from "@web3-react/core";

export default function Header() {
  const { active, activate, account, chainId } = useWeb3React();
  const connectWallet = () => {
    const injected = new InjectedConnector({
      supportedChainIds: [1, 31337, 3, 4, 5, 42],
    });
    console.log(chainId, injected);
    activate(injected);
    console.log(account);
  };
  return (
    <Box
      borderBottom={1}
      borderStyle={"solid"}
      borderColor={useColorModeValue("gray.200", "gray.900")}
    >
      <Container maxW="container.xl">
        <Flex
          bg={useColorModeValue("white", "gray.800")}
          color={useColorModeValue("gray.600", "white")}
          minH={"60px"}
          py={{ base: 2 }}
          px={{ base: 4 }}
          align={"center"}
        >
          <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
            <Text
              textAlign={useBreakpointValue({ base: "center", md: "left" })}
              fontFamily={"heading"}
              color={useColorModeValue("gray.800", "white")}
            >
              Raise The Stake
            </Text>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={6}
          >
            <Button
              onClick={connectWallet}
              fontSize={"sm"}
              fontWeight={600}
              color={"white"}
              bg={"blue.400"}
              href={"#"}
              _hover={{
                bg: "blue.300",
              }}
            >
              {active ? "Connected" : "Connect Wallet"}
            </Button>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
}
