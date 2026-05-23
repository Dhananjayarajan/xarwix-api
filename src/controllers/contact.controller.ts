import { Request, Response } from "express";
import pool from "../config/db";

export const createContact = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, message } =
      req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and message are required",
      });
    }

    const query = `
      INSERT INTO contacts
      (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [
      name,
      email,
      message,
    ];

    const result = await pool.query(
      query,
      values
    );

    res.status(201).json({
      success: true,
      message:
        "Contact submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Something went wrong",
    });
  }
};