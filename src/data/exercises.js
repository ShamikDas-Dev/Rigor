export const exerciseCategories = [
  {
    category: "Phase 1",
    items: [
      "Squat",
    ],
  },
  {
    category: "Planned",
    items: [
      "Push Up",
      "Plank",
      "Leg Raises",
      "Deadlift",
    ],
  },
];

export const allExercises =
  exerciseCategories.flatMap(
    (category) => category.items
  );
