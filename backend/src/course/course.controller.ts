import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('courses')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() createCourseDto: { title: string; description?: string; level: string }) {
        return this.courseService.create(createCourseDto);
    }

    @Get()
    findAll() {
        return this.courseService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.courseService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateCourseDto: { title?: string; description?: string; level?: string }) {
        return this.courseService.update(id, updateCourseDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.courseService.remove(id);
    }
}
