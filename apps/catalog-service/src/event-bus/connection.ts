import amqp, { ChannelModel } from "amqplib";

export const connectAMQP = async (): Promise<ChannelModel> => {
  const amqpUrl = process.env.AMQP_URL || "amqp://localhost";
  const connection = await amqp.connect(amqpUrl);
  return connection;
};
