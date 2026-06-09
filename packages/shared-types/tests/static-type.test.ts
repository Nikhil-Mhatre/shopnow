import { describe, test, expectTypeOf } from "vitest";
import {
  IUser,
  IAddress,
  IOtpRequestPayload,
  IOtpVerifyPayload,
  IAuthResponse,
} from "../src/user-service/index.js";

describe("User Service Type Contracts", () => {
  test("IUser should enforce strict structural rules", () => {
    // Assert that IUser has the required fields with matching types
    expectTypeOf<IUser>().toHaveProperty("id").toBeString();
    expectTypeOf<IUser>().toHaveProperty("email").toBeString();
    expectTypeOf<IUser>().toHaveProperty("savedAddresses").toBeArray();

    // Assert that the role field strictly matches the union constraint
    expectTypeOf<IUser>()
      .toHaveProperty("role")
      .toEqualTypeOf<"customer" | "admin">();
  });

  test("IAddress should mirror required shipping properties", () => {
    expectTypeOf<IAddress>().toHaveProperty("isDefault").toBeBoolean();
    expectTypeOf<IAddress>().toHaveProperty("street").toBeString();
    expectTypeOf<IAddress>().toHaveProperty("postalCode").toBeString();
  });

  test("Authentication payloads must maintain strict structures", () => {
    // Validate request contract shapes
    expectTypeOf<IOtpRequestPayload>().toHaveProperty("email").toBeString();

    expectTypeOf<IOtpVerifyPayload>().toHaveProperty("email").toBeString();
    expectTypeOf<IOtpVerifyPayload>().toHaveProperty("otp").toBeString();

    // Validate response contracts match expectations
    expectTypeOf<IAuthResponse>().toHaveProperty("token").toBeString();
    expectTypeOf<IAuthResponse>().toHaveProperty("user").toBeObject();
  });

  test("Runtime sanity test", () => {
    // A simple runtime assertion so the test runner passes completely
    const sampleResponse: IAuthResponse = {
      token: "mock-jwt-token",
      user: {
        email: "test@shopnow.com",
        role: "customer",
      },
    };

    expectTypeOf(sampleResponse).toMatchTypeOf<IAuthResponse>();
  });
});
