/*
  Warnings:

  - A unique constraint covering the columns `[course_id,order_no]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Chapter_course_id_order_no_key" ON "Chapter"("course_id", "order_no");

-- CreateIndex
CREATE UNIQUE INDEX "Course_title_key" ON "Course"("title");
