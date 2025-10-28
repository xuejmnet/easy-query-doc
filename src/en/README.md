---
home: true
icon: house
title: Home
heroFullScreen: true
heroImage: /images/logo.svg
bgImage: /images/bg/6-light.svg
bgImageDark: /images/bg/6-dark.svg
bgImageStyle:
  background-attachment: fixed
heroText: easy-query
tagline: 🚀 The most powerful ORM for Java (Kotlin supported)</br><span class="vuepress_typed"></span>
actions:
  - text: Get Started →
    icon: lightbulb
    link: ./feature-map
    type: primary

  - text: Video Tutorial 💻
    link: https://www.bilibili.com/video/BV17yWdzPE4M/
    type: default


highlights:
  - header: Implicit Queries
    image: /assets/image/features.svg
    bgImage: /easy-query-doc/images/bg/1-light.svg
    bgImageDark: /easy-query-doc/images/bg/1-dark.svg
    highlights:
      - title: Implicit Join
        icon: network-wired
        details: OneToOne, ManyToOne automatically implement join queries, filtering, sorting and result fetching

      - title: Implicit Subquery
        icon: comment-dots
        details: OneToMany, ManyToMany automatically implement subquery filtering, sorting and aggregate function result fetching

      - title: Implicit Grouping
        icon: circle-info
        details: OneToMany, ManyToMany automatically optimize subqueries, merging multiple subqueries into one grouped query with support for filtering, sorting and aggregate functions

      - title: Implicit Partition Grouping
        icon: lock
        details: OneToMany, ManyToMany automatically implement filtering, sorting and aggregate function results for first/Nth records

      - title: Implicit CASE WHEN
        icon: code
        details: Property.aggregate().filter(), e.g., o.age().sum().filter(()->o.name().like("123"))

  - header: Features
    description: A complete solution for JDBC-based relational database queries
    bgImage: /easy-query-doc/images/bg/2-light.svg
    bgImageDark: /easy-query-doc/images/bg/2-dark.svg
    bgImageStyle:
      background-repeat: repeat
      background-size: initial
    features:
      - title: Code-First
        icon: clipboard-check
        details: Rapidly generate and maintain database table structures based on entity objects

      - title: Elegant Object Relations
        icon: box-archive
        details: Perfectly combine DSL with object relations to perform database queries with simple dot notation

      - title: Arbitrary SQL Fragments
        icon: bell
        details: Support inserting arbitrary SQL fragments in DSL to ensure implementation of various customized SQL

      - title: POJO-Based
        icon: table-columns
        details: Framework implements database access based on POJOs, ensuring compatibility with most mainstream ORMs with one set of object code

      - title: Zero Dependencies
        icon: code
        details: Framework based on Java 8 and org.jetbrains.annotations (compile-time) with truly zero dependencies, a fully JDBC-based high-performance ORM that is completely self-controllable

      - title: One DSL
        icon: align-center
        details: Highly abstract elegant DSL for multiple database solutions into 'Java-like' methods, requiring only one set of code to run across multiple databases

      - title: Low Learning Curve
        icon: code
        details: Implement 'Stream API-like' operations to convert database operations into Java collection operations

      - title: Native Sharding
        icon: superscript
        details: Achieve high-performance sharding without introducing and deploying any middleware or JAR packages, with custom sharding support

      - title: Structured Object Fetching
        icon: quote-left
        details: Quickly create DTOs based on database object mapping relationships and fetch structured data

      - title: Seamless APT
        icon: highlighter
        details: Use plugins to quickly generate APT-required classes for seamless APT in IDEA, without requiring build||compile to immediately use APT classes

      - title: Quick Lambda Parameters
        icon: eraser
        details: Quickly implement lambda parameter input based on plugins and write DSL at the fastest speed

      - title: Group Awareness
        icon: square-check
        details: The only ORM in Java that supports group awareness, allowing data to transform from flat to structured when writing DSL

      - title: Rich APIs
        icon: image
        details: Provides commonly used APIs for returning collections, single objects, pagination, and features like dynamic conditions and dynamic sorting

      - title: Computed Properties
        icon: puzzle-piece
        details: Provides powerful in-memory and database computed properties, with database computed properties supporting filtering, sorting, and returning within DSL

      - title: Unlimited Extensibility
        icon: puzzle-piece
        details: EQ is a multi-instance framework with service isolation provided by an IoC container. All internal services can be replaced by users, and users can also inject any services to work with EQ

      - title: Direct DTO/VO Returns
        icon: chart-simple
        details: Directly map database result sets to DTOs/VOs, supporting explicit or implicit assignment for data fetching without frameworks like map-struct

      - title: Enterprise-Grade Column Encryption
        icon: route
        details: Support enterprise-grade database column encryption/decryption for improved data security after database breaches, with high-performance like searches on encrypted columns

      - title: Optimistic Locking
        icon: chart-pie
        details: Native support for optimistic locking to ensure database data concurrency safety and business logic accuracy

      - title: Data Tracking
        icon: diagram-project
        details: AOP-based data tracking during database queries to generate minimal granular updates

      - title: Logical Deletion
        icon: square-root-variable
        details: Native support for logical deletion and customizable logical deletion with support for recording deletion time, person, reason and other custom features


  - header: Structured DTO
    image: https://jowayyoung.github.io/static/bruce/install.svg
    bgImage: /easy-query-doc/images/bg/5-light.svg
    bgImageDark: /easy-query-doc/images/bg/5-dark.svg
    highlights:
      - title: Create DTO
        icon: window-maximize
        details: Right-click on a specified package using the plugin "Create Struct DTO", select the starting entity, and check the structure types to return
        link: https://theme-hope.vuejs.press/guide/layout/navbar.html

      - title: Query
        icon: fas fa-window-maximize fa-rotate-270
        details: Use <b>selectAutoInclude(DTO.class)</b> to query
        link: https://theme-hope.vuejs.press/guide/layout/sidebar.html

  - header: Computed Properties
    description: A special type of property column that differs from regular table columns - it's a property derived through table columns or more complex functions
    image: /assets/image/advanced.svg
    bgImage: /easy-query-doc/images/bg/4-light.svg
    bgImageDark: /easy-query-doc/images/bg/4-dark.svg
    highlights:
      - title: JSON Computed Properties
        icon: dumbbell
        details: Map objects to database columns using JSON format

      - title: Enum Computed Properties
        icon: sitemap
        details: Map enums to database columns; when using in Java, enum hints clearly show values and their meanings

      - title: Column Computed Properties
        icon: rss
        details: Special column processing through database functions, e.g., storing in database using base64 encode, retrieving using base64 decode

      - title: Non-Column Computed Properties
        icon: mobile-screen
        details: Columns that don't exist in the database, e.g., age calculated from current time and birthday, usable for filtering, sorting, and returning

      - title: Cross-Table Computed Properties
        icon: circle-info
        details: Properties obtained by combining values across multiple tables, e.g., class table can implement student count through subquery without redundant storage

  - header: Contact Us
    image: /assets/image/blog.svg
    bgImage: /easy-query-doc/images/bg/5-light.svg
    bgImageDark: /easy-query-doc/images/bg/5-dark.svg
    highlights:
      - title: Blog Features
        icon: blog
        details: Display articles by date, tags and categories

      - title: Blog Homepage
        icon: house
        details: Brand new blog homepage

      - title: Blogger Info
        icon: circle-info
        details: Customize name, avatar, motto and social media links

      - title: Timeline
        icon: clock
        details: Browse and read blog posts in timeline

copyright: false
footer: Apache 2.0 License, Copyright © 2022-present xuejmnet
---

