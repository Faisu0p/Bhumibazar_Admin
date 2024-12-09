import { query } from "../config/dbconfig.js";

// Helper function to validate parameters
function validateInput(input, paramName) {
  if (
    input === undefined ||
    input === null ||
    (typeof input === "string" && !input.trim())
  ) {
    throw new Error(`${paramName} cannot be null or empty`);
  }
}

// Create a new builder
export async function createBuilder(builderData) {
  const {
    city,
    builderCompleteName,
    builderShortName,
    builderLogo, // URL of the uploaded logo
    yearsInRealEstate,
    shortDescription,
    listOfProjects, // Array of project names or IDs
  } = builderData;

  // Validate mandatory fields
  validateInput(builderCompleteName, "Builder Complete Name");
  validateInput(builderShortName, "Builder Short Name");

  // Serialize listOfProjects into a JSON string
  const listOfProjectsJson = JSON.stringify(listOfProjects);

  const sql = `
    INSERT INTO Builders (
      city, builderCompleteName, builderShortName, builderLogo, yearsInRealEstate,
      shortDescription, listOfProjects
    ) VALUES (
      @param0, @param1, @param2, @param3, @param4,
      @param5, @param6
    );
    SELECT SCOPE_IDENTITY() AS id;
  `;

  const result = await query(sql, [
    city,
    builderCompleteName,
    builderShortName,
    builderLogo,
    yearsInRealEstate,
    shortDescription,
    listOfProjectsJson, // Insert JSON string for listOfProjects
  ]);

  return result[0].id;
}

// Retrieve a builder by ID, including the list of projects as an array
export async function getBuilderById(id) {
  validateInput(id, "Builder ID");

  const sql = `
    SELECT *,
           JSON_QUERY(listOfProjects, '$') AS listOfProjects  -- Parse listOfProjects as JSON
    FROM Builders
    WHERE id = @param0
  `;
  const result = await query(sql, [id]);

  // listOfProjects is already parsed by SQL query (no need to parse it in JS)
  return result[0];
}

// Update a builder
export async function updateBuilder(id, builderData) {
  validateInput(id, "Builder ID");

  const {
    city,
    builderCompleteName,
    builderShortName,
    builderLogo,
    yearsInRealEstate,
    shortDescription,
    listOfProjects,
  } = builderData;

  // Serialize listOfProjects into a JSON string before update
  const listOfProjectsJson = JSON.stringify(listOfProjects);

  const sql = `
    UPDATE Builders
    SET city = @param1, builderCompleteName = @param2, builderShortName = @param3,
        builderLogo = @param4, yearsInRealEstate = @param5,
        shortDescription = @param6, listOfProjects = @param7
    WHERE id = @param0
  `;

  await query(sql, [
    id,
    city,
    builderCompleteName,
    builderShortName,
    builderLogo,
    yearsInRealEstate,
    shortDescription,
    listOfProjectsJson, // Use serialized JSON for listOfProjects
  ]);
}

// Delete a builder
export async function deleteBuilder(id) {
  validateInput(id, "Builder ID");

  const sql = `
    DELETE FROM Builders WHERE id = @param0;
  `;
  await query(sql, [id]);
}

// Retrieve all builders
export async function getAllBuilders() {
  const sql = "SELECT * FROM Builders";
  return await query(sql);
}
