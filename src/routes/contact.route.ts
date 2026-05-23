import express from "express";
import {
  createContact,
} from "../controllers/contact.controller";

const router = express.Router();

router.post("/", createContact);

export default router;